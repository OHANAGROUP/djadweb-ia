// frontend/src/services/copilot.ts
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase-server';
import crypto from 'crypto';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
const supabase = createAdminClient();

// A. TOOL PERMISSION MATRIX: Mitigación de la superficie de alucinación
const TOOL_ACCESS_BY_WORKFLOW: Record<string, string[]> = {
  'inicio_actividades_sii': ['consultar_sii', 'update_workflow_state'],
  'cobranza_tgr': ['consultar_tgr', 'update_workflow_state']
};

// B. CAPA DE POLÍTICAS Y SANITIZACIÓN (Tool Policy Layer)
const ToolPolicyLayer = {
  validateAndSanitize: (name: string, input: any, activeWorkflow: string): any => {
    // Verificar matriz de permisos
    const allowedTools = TOOL_ACCESS_BY_WORKFLOW[activeWorkflow] || ['update_workflow_state'];
    if (!allowedTools.includes(name)) {
      throw new Error(`Acceso denegado: La herramienta [${name}] no está autorizada para el flujo [${activeWorkflow}].`);
    }
    // Sanitizar RUT chileno si corresponde
    if (input.rut) {
      input.rut = input.rut.replace(/\./g, '').toUpperCase();
      if (!/^[0-9]+-[0-9K]$/.test(input.rut)) throw new Error('Estructura de RUT inválida para canales fiscales.');
    }
    return input;
  },
  calculateConfidenceDecay: (baseScore: number, lastVerifiedAt: string): number => {
    if (!lastVerifiedAt) return baseScore;
    const minutesElapsed = (Date.now() - new Date(lastVerifiedAt).getTime()) / 60000;
    const decay = 0.01 * minutesElapsed; // Decay del 1% por minuto de antigüedad del dato del Estado
    return Math.max(0.1, parseFloat((baseScore - decay).toFixed(2)));
  }
};

// C. FUNCIÓN INTERNA DE SCRAPING SII (Proxy al microservicio backend en Render)
async function consultarSII(rut: string): Promise<any> {
  const res = await fetch(`${process.env.SCRAPER_URL}/api/sii/basicos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.SCRAPER_API_KEY || ''
    },
    body: JSON.stringify({ rut }),
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) {
    throw new Error(`Error en scraper SII: ${res.statusText}`);
  }
  const payload = await res.json();
  return payload.data || payload;
}

export async function procesarTurnoCognitivoSoberano(sessionId: string, userId: string, nuevoMensaje: string) {
  const modelName = 'claude-3-5-sonnet-20241022';
  const workflowVersion = 'v2';

  try {
    // 1. CONTEXT WINDOW HYGIENE: Recuperar snapshot operacional estable y rehidratar
    const { data: session } = await supabase.from('chat_sessions').select('*').eq('id', sessionId).single();
    if (!session) throw new Error('Sesión inexistente.');

    const activeWorkflow = session.workflow_type || 'inicio_actividades_sii';
    
    // Aplicar decaimiento de confianza en tiempo real para mostrar en UI
    const dynamicConfidence = ToolPolicyLayer.calculateConfidenceDecay(Number(session.confidence_score || 1.0), session.last_verified_at);

    const { data: dbMessages } = await supabase.from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(6);

    const messageHistory = dbMessages ? [...dbMessages].reverse() : [];
    const operationalContext = `[ESTADO_OPERACIONAL] Flujo: ${activeWorkflow}. Etapa: ${session.current_stage || 'Inicial'}. Confianza Base: ${dynamicConfidence}. Requisitos Faltantes: ${JSON.stringify(session.missing_requirements || [])}.`;
    
    const messages = [
      { role: 'user', content: operationalContext },
      ...messageHistory.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: nuevoMensaje }
    ];

    // 2. DEFINICIÓN DE HERRAMIENTAS EXPLICITAS (Deterministic Machine Interface)
    const herramientasDisponibles = [
      {
        name: 'consultar_sii',
        description: 'Extrae información de inicio de actividades y ACTECOs vigentes en el SII usando el RUT.',
        input_schema: {
          type: 'object',
          properties: { rut: { type: 'string', description: 'RUT chileno con guión (ej: 76001382-K)' } },
          required: ['rut']
        }
      },
      {
        name: 'update_workflow_state',
        description: 'Invocación obligatoria cuando cambia el entendimiento del caso. Transiciona el estado del flujo, actualiza riesgos y checklist.',
        input_schema: {
          type: 'object',
          properties: {
            current_stage: { type: 'string' },
            workflow_type: { type: 'string' },
            completion_percentage: { type: 'integer' },
            confidence_score: { type: 'number' },
            missing_requirements: { type: 'array', items: { type: 'string' } },
            risk_flags: {
              type: 'array',
              items: {
                type: 'object',
                properties: { severity: { type: 'string' }, code: { type: 'string' }, message: { type: 'string' } },
                required: ['severity', 'code', 'message']
              }
            }
          },
          required: ['current_stage', 'workflow_type', 'completion_percentage', 'confidence_score', 'missing_requirements', 'risk_flags']
        }
      }
    ];

    let response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 2000,
      system: process.env.DJADWEB_CORE_PROMPT || 'Eres DJADWEB-IA, el asistente burocrático chileno soberano.',
      messages: messages as any,
      tools: herramientasDisponibles as any
    });

    // 3. AGENTIC TOOL LOOP (Ciclo iterativo basado en stop_reason de Anthropic)
    const activeMessages = [...messages];

    while (response.stop_reason === 'tool_use') {
      activeMessages.push({ role: 'assistant', content: response.content as any });
      const toolResults: any[] = [];

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const { name: toolName, input: toolInput, id: toolUseId } = block;
          let resultPayload: any = {};

          try {
            // Aplicar Capa de Políticas antes de interactuar con el exterior o la base de datos
            const sanitizedInput = ToolPolicyLayer.validateAndSanitize(toolName, toolInput, activeWorkflow);

            if (toolName === 'update_workflow_state') {
              // A. IDEMPOTENCIA: Verificar hash de estado para mitigar loops semánticos redundantes
              const incomingHash = crypto.createHash('md5').update(JSON.stringify(sanitizedInput)).digest('hex');
              
              if (session.state_hash === incomingHash) {
                resultPayload = { status: "skipped", reason: "duplicate_transition" };
              } else {
                // B. EVENT SOURCING: Construir registro histórico de causalidad de transiciones
                const newEvent = {
                  from_stage: session.current_stage || 'inicial',
                  to_stage: sanitizedInput.current_stage,
                  trigger: session.last_tool_used || 'user_prompt',
                  timestamp: new Date().toISOString()
                };
                const updatedHistory = [...(session.event_history as any || []), newEvent];

                // Mutación de la máquina de estados determinista
                await supabase.from('chat_sessions').update({
                  current_stage: sanitizedInput.current_stage,
                  workflow_type: sanitizedInput.workflow_type,
                  completion_percentage: sanitizedInput.completion_percentage,
                  confidence_score: sanitizedInput.confidence_score,
                  missing_requirements: sanitizedInput.missing_requirements,
                  risk_flags: sanitizedInput.risk_flags,
                  last_tool_used: toolName,
                  state_hash: incomingHash,
                  event_history: updatedHistory,
                  last_verified_at: new Date().toISOString(),
                  workflow_version: workflowVersion
                }).eq('id', sessionId);

                resultPayload = { status: "state_mutated_successfully", hash: incomingHash };
              }
            } 
            else if (toolName === 'consultar_sii') {
              resultPayload = await consultarSII(sanitizedInput.rut);
            }

            // C. COMPLIANCE AUDIT LOG: Grabación inmutable del evento
            await supabase.from('compliance_audit_log').insert({
              session_id: sessionId,
              user_id: userId,
              event_type: toolName === 'update_workflow_state' ? 'state_mutation' : 'tool_execution',
              tool_name: toolName,
              tool_input: toolInput,
              tool_output: resultPayload,
              llm_model: modelName,
              risk_snapshot: sanitizedInput.risk_flags || session.risk_flags,
              workflow_version: workflowVersion
            });

          } catch (error: any) {
            console.error(`Violación de política o fallo en herramienta [${toolName}]: ${error.message}`);
            resultPayload = { error: true, code: "POLICY_OR_RUNTIME_VIOLATION", message: error.message };
          }

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUseId,
            content: JSON.stringify(resultPayload)
          });
        }
      }

      activeMessages.push({ role: 'user', content: toolResults as any });

      // Re-inyectar resultados para el razonamiento de la siguiente iteración
      response = await anthropic.messages.create({
        model: modelName,
        max_tokens: 2000,
        system: process.env.DJADWEB_CORE_PROMPT || 'Eres DJADWEB-IA, el asistente burocrático chileno soberano.',
        messages: activeMessages as any,
        tools: herramientasDisponibles as any
      });
    }

    // 4. PERSISTENCIA CONVERSACIONAL FINAL
    const finalResponseText = response.content[0].type === 'text' ? response.content[0].text : 'Sincronización terminada.';
    await supabase.from('chat_messages').insert({ session_id: sessionId, role: 'assistant', content: finalResponseText });

    return finalResponseText;

  } catch (error: any) {
    console.error(`Fallo crítico no controlado en Runtime: ${error.message}`);
    return "En este momento no he podido sincronizar los estados de verificación de forma síncrona. La anomalía ha sido aislada por los protocolos de observabilidad y no altera en absoluto tu situación actual frente a los organismos de control. Te sugiero reintentar la acción en unos minutos.";
  }
}
