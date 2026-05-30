// frontend/src/services/flowEngine.ts
/**
 * FlowEngine v2 — Motor de Flujo Procedimental determinista guiado por Event Sourcing.
 *
 * Se integra al 100% con el SessionEngine para basar todo el flujo de trámites
 * en sesiones persistentes multi-día rehidratables, registrando cada paso y
 * consulta con cripto-auditoría.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createAdminClient } from '@/lib/supabase-server'
import { getTramiteById, getAllTramites } from '@/lib/registry/tramites'
import { SessionEngine } from '@/core/session-engine/sessionEngine'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const supabase = createAdminClient()
const sessionEngine = new SessionEngine(supabase)
const MODEL_NAME = 'gemini-1.5-flash'

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
 * Brinda asistencia contextual sobre un paso específico de un trámite
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
 * Procesa la interacción del usuario con el Flow Engine (Session-First)
 */
export async function processFlowAction(
  sessionId: string,
  userId: string,
  action: string, // Comandos internos (__ACTION__*) o chat del usuario
  payload?: any
) {
  // 1. Rehidratar la sesión y aplicar contrato de continuidad multi-día
  const { ContinuityEngine } = await import('@/core/session-engine/continuityEngine')
  const continuityEngine = new ContinuityEngine(supabase)
  
  const { session, events, revalidated, changesDetected, log } = 
    await continuityEngine.rehydrateAndValidateSession(sessionId, userId)

  if (!session) {
    throw new Error('Sesión no encontrada.')
  }

  // 1.05 Evaluar invariantes operacionales del FVL Layer
  const { RuntimeGuardian } = await import('@/core/guardian/runtimeGuardian')
  const guardian = new RuntimeGuardian(supabase)
  
  const invariantCheck = await guardian.evaluateInvariants(
    sessionId,
    userId,
    { type: action, payload },
    'live'
  )

  if (!invariantCheck.passed) {
    const { session: updatedSession } = await continuityEngine.rehydrateAndValidateSession(sessionId, userId)
    return {
      type: 'error',
      content: `Acción bloqueada por violación formal de invariantes: ${invariantCheck.violations[0].description}`,
      session: updatedSession
    }
  }

  // 1.06 Evaluar Causal Execution Graph Engine (CEGE v1)
  const { CausalExecutionEngine } = await import('@/core/causal-engine/causalExecutionEngine')
  const cege = new CausalExecutionEngine()
  const cegeCheck = cege.simulate(session, events, action)

  if (!cegeCheck.passed) {
    const { session: updatedSession } = await continuityEngine.rehydrateAndValidateSession(sessionId, userId)
    return {
      type: 'error',
      content: `Acción bloqueada por fallo en pre-computación causal (CEGE): Rama no segura o pre-computada.`,
      session: updatedSession
    }
  }

  // 1.1 Ejecutar supervisión de seguridad mediante el RuntimeGuardian
  const validation = await guardian.validateSession(sessionId, userId)

  if (validation.action === 'FROZEN_ROLLBACK' || validation.action === 'FROZEN_DRIFT') {
    return {
      type: 'error',
      content: `Transición suspendida por el supervisor de seguridad: ${validation.message}`,
      session: validation.session
    }
  }

  let currentTramiteId = session.tramite_id
  let currentStepId = session.current_step

  // 2. Si no hay trámite asignado, intentar clasificar
  if (currentTramiteId === 'default' || !currentTramiteId) {
    if (!action.startsWith('__ACTION__')) {
      const detectedId = await clasificarIntencionTramite(action)

      if (detectedId === 'unknown') {
        const respuesta = 'Lo siento, no he entendido qué trámite necesitas realizar o aún no lo tenemos disponible. ¿Puedes ser más específico?'
        
        // Registrar evento de intento fallido
        await sessionEngine.addEvent(sessionId, userId, 'INTENT_CLASSIFICATION_FAILED', {
          query: action,
          response: respuesta
        })

        return { type: 'chat', content: respuesta }
      }

      const detectedTramite = getTramiteById(detectedId)
      if (!detectedTramite) {
        return { type: 'error', content: 'Trámite detectado pero no configurado.' }
      }

      const firstStepId = detectedTramite.steps[0].id

      // Actualizar la sesión con el trámite y el primer paso
      await supabase
        .from('tramite_sessions')
        .update({
          tramite_id: detectedId,
          current_step: firstStepId,
          progress: 0
        })
        .eq('id', sessionId)

      // Registrar evento de inicio de trámite guiado
      await sessionEngine.addEvent(sessionId, userId, 'TRAMITE_STARTED', {
        tramite_id: detectedId,
        starting_step: firstStepId,
        user_query: action
      })

      // También registrar en tramite_outcomes si no existe
      const { data: existingOutcome } = await supabase
        .from('tramite_outcomes')
        .select('*')
        .eq('session_id', sessionId)
        .eq('tramite_id', detectedId)

      if (!existingOutcome || existingOutcome.length === 0) {
        await supabase.from('tramite_outcomes').insert({
          user_id: userId,
          session_id: sessionId,
          tramite_id: detectedId,
          institution: detectedTramite.institution,
          category: detectedTramite.category,
          status: 'in_progress',
          steps_completed: 0,
          total_steps: detectedTramite.steps.length
        })
      }

      return { type: 'flow_started', tramiteId: detectedId, stepId: firstStepId }
    }
  }

  const tramite = getTramiteById(currentTramiteId)
  if (!tramite) {
    return { type: 'error', content: 'Trámite no válido.' }
  }

  // 3. Avance de Paso Explícito
  if (action === '__ACTION__NEXT__') {
    const currentIndex = tramite.steps.findIndex(s => s.id === currentStepId)
    
    if (currentIndex >= 0 && currentIndex < tramite.steps.length - 1) {
      const nextStepId = tramite.steps[currentIndex + 1].id
      const progress = Math.round(((currentIndex + 1) / tramite.steps.length) * 100)

      // Registrar evento y actualizar sesión
      await sessionEngine.addEvent(sessionId, userId, 'STEP_ADVANCED', {
        previousStep: currentStepId,
        currentStep: nextStepId,
        progress
      })

      // Actualizar Outcome
      await supabase
        .from('tramite_outcomes')
        .update({
          steps_completed: currentIndex + 2
        })
        .eq('session_id', sessionId)
        .eq('tramite_id', currentTramiteId)

      return { type: 'step_advanced', tramiteId: currentTramiteId, stepId: nextStepId }
    } else if (currentIndex === tramite.steps.length - 1) {
      // Completar sesión
      await sessionEngine.completeSession(sessionId, userId)

      // Actualizar Outcome a completado
      await supabase
        .from('tramite_outcomes')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          steps_completed: tramite.steps.length
        })
        .eq('session_id', sessionId)
        .eq('tramite_id', currentTramiteId)

      return { type: 'flow_completed', tramiteId: currentTramiteId }
    }
    return { type: 'error', content: 'No se puede avanzar más.' }
  }

  // 4. Retroceso de Paso Explícito
  if (action === '__ACTION__PREV__') {
    const currentIndex = tramite.steps.findIndex(s => s.id === currentStepId)
    
    if (currentIndex > 0) {
      const prevStepId = tramite.steps[currentIndex - 1].id
      const progress = Math.round(((currentIndex - 1) / tramite.steps.length) * 100)

      await sessionEngine.addEvent(sessionId, userId, 'STEP_REGRESSED', {
        previousStep: currentStepId,
        currentStep: prevStepId,
        progress
      })

      return { type: 'step_regressed', tramiteId: currentTramiteId, stepId: prevStepId }
    }
    return { type: 'error', content: 'No se puede retroceder más.' }
  }

  // 5. Asistencia Contextual de UI (__ACTION__HELP__)
  if (action === '__ACTION__HELP__') {
    const pasoActual = tramite.steps.find(s => s.id === currentStepId)
    const promptHelp = `El usuario no encuentra cómo proceder en este paso de la pantalla oficial.
Paso actual: ${pasoActual?.title}
Instrucción original: ${pasoActual?.instruction}

Por favor, dale instrucciones extremadamente tácticas y simples de interfaz de usuario. Por ejemplo: "Busca un botón verde en la esquina superior derecha" o "Revisa en el menú lateral bajo la sección X". Responde de forma directa, sin saludos.`

    // Registrar inicio de consulta de asistencia
    await sessionEngine.addEvent(sessionId, userId, 'HELP_REQUESTED', {
      currentStep: currentStepId,
      promptHelp
    })

    const respuesta = await asistenciaContextual(promptHelp, currentTramiteId, currentStepId)

    // Registrar respuesta del LLM
    await sessionEngine.addEvent(sessionId, userId, 'LLM_CALLED', {
      model: MODEL_NAME,
      query: promptHelp,
      response: respuesta
    })

    return { type: 'chat', content: respuesta, tramiteId: currentTramiteId, stepId: currentStepId }
  }

  // 6. Mensaje de Texto Libre (Consultas generales durante el paso)
  if (!action.startsWith('__ACTION__')) {
    // Registrar consulta del usuario
    await sessionEngine.addEvent(sessionId, userId, 'USER_CHAT_RECEIVED', {
      message: action
    })

    const respuesta = await asistenciaContextual(action, currentTramiteId, currentStepId)

    // Registrar respuesta del LLM
    await sessionEngine.addEvent(sessionId, userId, 'LLM_ASSIST_RESPONDED', {
      model: MODEL_NAME,
      response: respuesta
    })

    return { type: 'chat', content: respuesta, tramiteId: currentTramiteId, stepId: currentStepId }
  }

  return { type: 'unknown_action' }
}
