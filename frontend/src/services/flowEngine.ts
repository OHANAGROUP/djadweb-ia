import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { createAdminClient } from '@/lib/supabase-server'
import { getTramiteById, getAllTramites } from '@/lib/registry/tramites'
import crypto from 'crypto'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const supabase = createAdminClient()
const MODEL_NAME = 'gemini-1.5-flash' // Fast and efficient for classification

/**
 * Resuelve la intención del usuario a un trámite específico
 */
async function clasificarIntencionTramite(mensaje: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: 'Eres un enrutador de trámites de Tramita. Tu única función es leer la solicitud del usuario y devolver el ID del trámite correspondiente. Si no coincide con ninguno, devuelve "unknown".'
  })

  const tramites = getAllTramites()
  const tramitesList = tramites.map(t => `- ID: ${t.id} | Descripción: ${t.goal} - ${t.description}`).join('\n')

  const prompt = `
Lista de trámites soportados:
${tramitesList}

Mensaje del usuario: "${mensaje}"

¿Qué ID de trámite corresponde mejor? Responde SOLO con el ID. Si es ambiguo o no coincide, responde "unknown".`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    if (tramites.some(t => t.id === text)) {
      return text
    }
    return 'unknown'
  } catch (error) {
    console.error('Error clasificando intención:', error)
    return 'unknown'
  }
}

/**
 * Brinda asistencia contextual sobre un paso
 */
async function asistenciaContextual(mensaje: string, tramiteId: string, stepId: string): Promise<string> {
  const tramite = getTramiteById(tramiteId)
  if (!tramite) return 'Trámite no encontrado.'

  const pasoActual = tramite.steps.find(s => s.id === stepId)
  if (!pasoActual) return 'Paso no encontrado.'

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: 'Eres Tramita, un asistente que guía a usuarios en trámites del Estado chileno. Responde de manera clara, amigable y profesional. NO ejecutas acciones por ellos, solo explicas cómo hacerlo.'
  })

  const prompt = `
Contexto Actual:
Trámite: ${tramite.goal} (${tramite.institution})
Paso actual del usuario: ${pasoActual.title}
Instrucción del paso: ${pasoActual.instruction}
Advertencias del paso: ${pasoActual.warnings ? pasoActual.warnings.join(', ') : 'Ninguna'}

Mensaje/Pregunta del usuario: "${mensaje}"

Responde la pregunta del usuario usando el contexto de este paso de manera directa y concisa.`

  try {
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Error en asistencia contextual:', error)
    return 'Ocurrió un error al procesar tu duda. Por favor, intenta de nuevo.'
  }
}

/**
 * Procesa la interacción del usuario con el Flow Engine
 */
export async function processFlowAction(
  sessionId: string,
  userId: string,
  action: string, // Mensaje del usuario o comandos como '__ACTION__NEXT__'
  payload?: any
) {
  // 1. Obtener la sesión
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error('Sesión no encontrada.')
  }

  // 2. Si no hay trámite asignado, intentar clasificar
  let currentTramiteId = session.workflow_type
  let currentStepId = session.current_stage

  if (!currentTramiteId || currentTramiteId === 'default' || currentTramiteId === 'inicio_actividades_sii') {
    // Si la acción no es un comando interno, es el primer mensaje
    if (!action.startsWith('__ACTION__')) {
      const detectedId = await clasificarIntencionTramite(action)
      
      // Actualizar la base de datos
      await supabase.from('chat_sessions').update({
        workflow_type: detectedId,
        current_stage: detectedId !== 'unknown' ? getTramiteById(detectedId)?.steps[0].id : 'inicial'
      }).eq('id', sessionId)
      
      currentTramiteId = detectedId
      currentStepId = detectedId !== 'unknown' ? getTramiteById(detectedId)?.steps[0].id : 'inicial'

      // Registrar mensaje del usuario
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: action,
      })

      if (detectedId === 'unknown') {
        const respuesta = "Lo siento, no he entendido qué trámite necesitas realizar o aún no lo tenemos disponible. ¿Puedes ser más específico?"
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: respuesta,
          tokens_used: 0,
        })
        return { type: 'chat', content: respuesta }
      }

      // Crear Outcome Tracking al iniciar flujo
      const detectedTramite = getTramiteById(detectedId)
      if (detectedTramite) {
        await supabase.from('tramite_outcomes').insert({
          user_id: userId,
          session_id: sessionId,
          tramite_id: detectedId,
          institution: detectedTramite.institution,
          category: detectedTramite.category,
          status: 'in_progress',
          steps_completed: 0,
          total_steps: detectedTramite.steps.length,
        })
      }

      return { type: 'flow_started', tramiteId: currentTramiteId, stepId: currentStepId }
    }
  }

  const tramite = getTramiteById(currentTramiteId)
  if (!tramite) {
    return { type: 'error', content: 'Trámite no válido.' }
  }

  // 3. Manejar avance de paso explícito
  if (action === '__ACTION__NEXT__') {
    const currentIndex = tramite.steps.findIndex(s => s.id === currentStepId)
    if (currentIndex >= 0 && currentIndex < tramite.steps.length - 1) {
      const nextStepId = tramite.steps[currentIndex + 1].id
      await supabase.from('chat_sessions').update({
        current_stage: nextStepId
      }).eq('id', sessionId)

      // Actualizar Outcome: incrementar steps_completed
      await supabase.from('tramite_outcomes').update({
        steps_completed: currentIndex + 2  // +1 por 0-index, +1 por avance
      }).eq('session_id', sessionId).eq('tramite_id', currentTramiteId)

      return { type: 'step_advanced', tramiteId: currentTramiteId, stepId: nextStepId }
    } else if (currentIndex === tramite.steps.length - 1) {
      // Marcar Outcome como completado
      await supabase.from('tramite_outcomes').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        steps_completed: tramite.steps.length
      }).eq('session_id', sessionId).eq('tramite_id', currentTramiteId)

      return { type: 'flow_completed', tramiteId: currentTramiteId }
    }
    return { type: 'error', content: 'No se puede avanzar.' }
  }

  if (action === '__ACTION__PREV__') {
    const currentIndex = tramite.steps.findIndex(s => s.id === currentStepId)
    if (currentIndex > 0) {
      const prevStepId = tramite.steps[currentIndex - 1].id
      await supabase.from('chat_sessions').update({
        current_stage: prevStepId
      }).eq('id', sessionId)
      return { type: 'step_regressed', tramiteId: currentTramiteId, stepId: prevStepId }
    }
    return { type: 'error', content: 'No se puede retroceder más.' }
  }

  // 4. Manejar solicitud heurística de ayuda UI (__ACTION__HELP__)
  if (action === '__ACTION__HELP__') {
    const pasoActual = tramite.steps.find(s => s.id === currentStepId)
    const promptHelp = `El usuario no encuentra cómo proceder en este paso de la pantalla oficial.
Paso actual: ${pasoActual?.title}
Instrucción original: ${pasoActual?.instruction}

Por favor, dale instrucciones extremadamente tácticas y simples de interfaz de usuario. Por ejemplo: "Busca un botón verde en la esquina superior derecha" o "Revisa en el menú lateral bajo la sección X". Responde de forma directa, sin saludos.`

    const respuesta = await asistenciaContextual(promptHelp, currentTramiteId, currentStepId)
    
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: respuesta,
      tokens_used: 0,
    })

    return { type: 'chat', content: respuesta, tramiteId: currentTramiteId, stepId: currentStepId }
  }

  // 5. Si es un mensaje de texto normal durante el flujo, dar asistencia contextual
  if (!action.startsWith('__ACTION__')) {
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: action,
    })

    const respuesta = await asistenciaContextual(action, currentTramiteId, currentStepId)

    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: respuesta,
      tokens_used: 0,
    })

    return { type: 'chat', content: respuesta, tramiteId: currentTramiteId, stepId: currentStepId }
  }

  return { type: 'unknown_action' }
}
