/**
 * copilot.ts — Copiloto tributario y judicial de Tramita.
 *
 * Fase actual: Observabilidad tributaria (Fase 1).
 * F29 automatico / credenciales SII son Fase 3 y NO estan implementados.
 *
 * Cambios criticos vs version anterior:
 *  - Mensaje de usuario se persiste ANTES del procesamiento IA (evita perdida por timeout).
 *  - consultar_tgr implementado.
 *  - consultar_f29_sii eliminado (Fase 3).
 *  - Lenguaje neutro en system prompt y errores.
 *  - TOOL_ACCESS_BY_WORKFLOW usa 'default' como fallback.
 */

import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase-server'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { verificarTransicionEstado } from '@/lib/workflowGraph'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })
const supabase = createAdminClient()

const MODEL_NAME = 'claude-3-5-sonnet-20241022'
const WORKFLOW_VERSION = 'v2-gold'
const MAX_ITERATIONS = 6

function getSystemPrompt(): string {
  if (process.env.TRAMITA_SYSTEM_PROMPT) return process.env.TRAMITA_SYSTEM_PROMPT
  try {
    const promptPath = path.join(process.cwd(), 'prompts', 'system.txt')
    if (fs.existsSync(promptPath)) return fs.readFileSync(promptPath, 'utf8')
  } catch (e: any) {
    console.warn('[Copiloto] Error al cargar prompts/system.txt:', e.message)
  }
  return `Eres el asistente tributario y judicial de Tramita, una plataforma de consulta para personas y pymes chilenas.

Tu funcion es ayudar a consultar, interpretar y hacer seguimiento de informacion del SII, Tesoreria General de la Republica (TGR) y el Poder Judicial (PJUD).

Principios:
- Responde en espanol claro, directo y profesional.
- No inventes informacion fiscal. Si no tienes datos, dilo.
- No prometas automatizaciones: Tramita hoy es una herramienta de consulta y monitoreo.
- Si el usuario necesita presentar declaraciones, indicale que debe hacerlo directamente en el portal correspondiente.
- No repitas RUTs ni datos sensibles en tus respuestas.`
}

const TOOL_ACCESS_BY_WORKFLOW: Record<string, string[]> = {
  'inicio_actividades_sii': ['consultar_sii', 'update_workflow_state'],
  'cobranza_tgr':           ['consultar_tgr', 'update_workflow_state'],
  'monitoreo_judicial':     ['update_workflow_state'],
  'default':                ['consultar_sii', 'consultar_tgr', 'update_workflow_state'],
}

const ToolPolicyLayer = {
  validateAndSanitize(name: string, input: any, activeWorkflow: string): any {
    const allowedTools = TOOL_ACCESS_BY_WORKFLOW[activeWorkflow] ?? TOOL_ACCESS_BY_WORKFLOW['default']
    if (!allowedTools.includes(name)) {
      throw new Error(`Herramienta [${name}] no autorizada para el flujo [${activeWorkflow}].`)
    }
    if (input.rut) {
      input.rut = input.rut.replace(/\./g, '').toUpperCase().trim()
      if (!/^[0-9]+-[0-9K]$/.test(input.rut)) {
        throw new Error('RUT con formato invalido. Use formato 12345678-9 o 76001382-K.')
      }
    }
    return input
  },
  calculateConfidenceDecay(baseScore: number, lastVerifiedAt: string): number {
    if (!lastVerifiedAt) return baseScore
    const minutesElapsed = (Date.now() - new Date(lastVerifiedAt).getTime()) / 60_000
    return Math.max(0.1, parseFloat((baseScore - 0.01 * minutesElapsed).toFixed(2)))
  },
}

async function consultarSII(rut: string, correlationId: string): Promise<any> {
  const res = await fetch(`${process.env.SCRAPER_URL}/api/sii/basicos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.SCRAPER_API_KEY || '',
      'X-Correlation-ID': correlationId,
    },
    body: JSON.stringify({ rut }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`Error en scraper SII: ${res.statusText}`)
  const payload = await res.json()
  return payload.data ?? payload
}

async function consultarTGR(rut: string, correlationId: string): Promise<any> {
  const res = await fetch(`${process.env.SCRAPER_URL}/api/tgr/deuda`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.SCRAPER_API_KEY || '',
      'X-Correlation-ID': correlationId,
    },
    body: JSON.stringify({ rut }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`Error en scraper TGR: ${res.statusText}`)
  const payload = await res.json()
  return payload.data ?? payload
}

const HERRAMIENTAS: Anthropic.Tool[] = [
  {
    name: 'consultar_sii',
    description: 'Consulta datos del contribuyente y su estado tributario en el SII usando el RUT.',
    input_schema: {
      type: 'object',
      properties: { rut: { type: 'string', description: 'RUT chileno con guion (ej: 76001382-K)' } },
      required: ['rut'],
    },
  },
  {
    name: 'consultar_tgr',
    description: 'Consulta la deuda fiscal del contribuyente en la Tesoreria General de la Republica (TGR) usando el RUT.',
    input_schema: {
      type: 'object',
      properties: { rut: { type: 'string', description: 'RUT chileno con guion (ej: 76001382-K)' } },
      required: ['rut'],
    },
  },
  {
    name: 'update_workflow_state',
    description: 'Actualiza el estado del flujo de trabajo: etapa, avance, requerimientos faltantes y flags de riesgo.',
    input_schema: {
      type: 'object',
      properties: {
        current_stage:         { type: 'string' },
        workflow_type:         { type: 'string' },
        completion_percentage: { type: 'integer' },
        confidence_score:      { type: 'number' },
        missing_requirements:  { type: 'array', items: { type: 'string' } },
        risk_flags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              severity: { type: 'string' },
              code:     { type: 'string' },
              message:  { type: 'string' },
            },
            required: ['severity', 'code', 'message'],
          },
        },
      },
      required: [
        'current_stage', 'workflow_type', 'completion_percentage',
        'confidence_score', 'missing_requirements', 'risk_flags',
      ],
    },
  },
]

export async function procesarMensajeChat(
  sessionId: string,
  userId: string,
  nuevoMensaje: string,
  parentCorrelationId?: string
) {
  const correlationId = parentCorrelationId ?? crypto.randomUUID()

  try {
    console.log(`[${correlationId}] Iniciando turno — sesion: ${sessionId}`)

    // PASO 1: Persistir mensaje de usuario ANTES del procesamiento.
    // Garantiza que nunca se pierde contexto por timeout o excepcion.
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: nuevoMensaje,
    })

    // Advisory lock (previene race conditions en sesiones concurrentes)
    try {
      await supabase.rpc('adquirir_advisory_lock_sesion', { target_session_id: sessionId })
    } catch (e: any) {
      console.warn(`[${correlationId}] Advisory lock no disponible:`, e.message)
    }

    // Rehidratacion de contexto
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session) throw new Error('Sesion no encontrada.')

    const activeWorkflow = session.workflow_type ?? 'default'
    const etapaActual = session.current_stage ?? 'inicial'
    const dynamicConf = ToolPolicyLayer.calculateConfidenceDecay(
      Number(session.confidence_score ?? 1.0),
      session.last_verified_at
    )

    const { data: dbMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(6)

    const messageHistory = dbMessages ? [...dbMessages].reverse() : []
    const operationalCtx = (
      `[ESTADO] Flujo: ${activeWorkflow}. Etapa: ${etapaActual}. ` +
      `Confianza: ${dynamicConf}. Faltante: ${JSON.stringify(session.missing_requirements ?? [])}.`
    )

    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: operationalCtx },
      ...messageHistory.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content as string,
      })),
      { role: 'user', content: nuevoMensaje },
    ]

    let response = await anthropic.messages.create({
      model: MODEL_NAME,
      max_tokens: 2000,
      system: getSystemPrompt(),
      messages,
      tools: HERRAMIENTAS,
    })

    const activeMessages = [...messages]
    let toolIterationCount = 0

    while (response.stop_reason === 'tool_use') {
      toolIterationCount++

      if (toolIterationCount > MAX_ITERATIONS) {
        await registrarTelemetria(sessionId, correlationId, 'agentic_loop_exceeded', { iterations: toolIterationCount })
        throw new Error(`Limite de iteraciones agénticas alcanzado (${MAX_ITERATIONS}).`)
      }

      activeMessages.push({ role: 'assistant', content: response.content })
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue

        const { name: toolName, input: toolInput, id: toolUseId } = block
        let resultPayload: any = {}
        const t0 = Date.now()

        try {
          const sanitized = ToolPolicyLayer.validateAndSanitize(toolName, toolInput, activeWorkflow)

          if (toolName === 'update_workflow_state') {
            const etapaPropuesta = sanitized.current_stage

            if (!verificarTransicionEstado(etapaActual, etapaPropuesta) && etapaActual !== etapaPropuesta) {
              throw new Error(`Transicion no permitida: [${etapaActual} -> ${etapaPropuesta}].`)
            }

            const newHash = crypto
              .createHash('sha256')
              .update(JSON.stringify(sanitized))
              .digest('hex')

            if (session.state_hash === newHash) {
              resultPayload = { status: 'skipped', reason: 'duplicate_transition' }
            } else {
              const newEvent = {
                from_stage: session.current_stage ?? 'inicial',
                to_stage: etapaPropuesta,
                trigger: toolName,
                timestamp: new Date().toISOString(),
              }

              await supabase.from('chat_sessions').update({
                current_stage: etapaPropuesta,
                workflow_type: sanitized.workflow_type,
                completion_percentage: sanitized.completion_percentage,
                confidence_score: sanitized.confidence_score,
                missing_requirements: sanitized.missing_requirements,
                risk_flags: sanitized.risk_flags,
                last_tool_used: toolName,
                state_hash: newHash,
                event_history: [...((session.event_history as any[]) ?? []), newEvent],
                last_verified_at: new Date().toISOString(),
                workflow_version: WORKFLOW_VERSION,
              }).eq('id', sessionId)

              resultPayload = { status: 'state_updated', hash: newHash }
            }
          } else if (toolName === 'consultar_sii') {
            resultPayload = await consultarSII(sanitized.rut, correlationId)
          } else if (toolName === 'consultar_tgr') {
            resultPayload = await consultarTGR(sanitized.rut, correlationId)
          }

          await supabase.from('compliance_audit_log').insert({
            session_id: sessionId,
            user_id: userId,
            event_type: toolName === 'update_workflow_state' ? 'state_mutation' : 'tool_execution',
            tool_name: toolName,
            tool_input: toolInput,
            tool_output: resultPayload,
            llm_model: MODEL_NAME,
            risk_snapshot: sanitized.risk_flags ?? session.risk_flags,
            workflow_version: WORKFLOW_VERSION,
            correlation_id: correlationId,
            token_input_count: response.usage?.input_tokens ?? 0,
            token_output_count: response.usage?.output_tokens ?? 0,
            tool_iteration_count: toolIterationCount,
            runtime_ms: Date.now() - t0,
          })

        } catch (error: any) {
          console.error(`[${correlationId}] Tool [${toolName}] error:`, error.message)
          resultPayload = { error: true, code: 'TOOL_ERROR', message: error.message }
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUseId,
          content: JSON.stringify(resultPayload),
        })
      }

      activeMessages.push({ role: 'user', content: toolResults })

      response = await anthropic.messages.create({
        model: MODEL_NAME,
        max_tokens: 2000,
        system: getSystemPrompt(),
        messages: activeMessages,
        tools: HERRAMIENTAS,
      })
    }

    const finalText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Consulta procesada.'

    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: finalText,
      tokens_used: (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0),
    })

    return finalText

  } catch (error: any) {
    console.error(`[${correlationId}] Error en copiloto:`, error.message)
    return 'Ocurrio un error al procesar tu consulta. Por favor intenta nuevamente en unos segundos.'
  }
}

async function registrarTelemetria(
  sessionId: string,
  correlationId: string,
  eventType: string,
  payload: any
) {
  console.warn(`[TELEMETRIA][${correlationId}] ${eventType}:`, JSON.stringify(payload))
}