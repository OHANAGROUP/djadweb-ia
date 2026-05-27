// frontend/src/services/copilot.ts
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase-server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { verificarTransicionEstado } from '@/lib/workflowGraph';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
const supabase = createAdminClient();

function getSystemPrompt(): string {
  if (process.env.DJADWEB_CORE_PROMPT) return process.env.DJADWEB_CORE_PROMPT;
  try {
    const promptPath = path.join(process.cwd(), 'prompts', 'system.txt');
    if (fs.existsSync(promptPath)) {
      return fs.readFileSync(promptPath, 'utf8');
    }
  } catch (e: any) {
    console.warn('Error al cargar prompts/system.txt de forma física:', e.message);
  }
  return `Eres DJADWEB-IA®, el copiloto cognitivo e institucional soberano diseñado para navegar y simplificar la burocracia chilena de los ciudadanos y empresas.`;
}

// A. TOOL PERMISSION MATRIX: Mitigación de la superficie de alucinación
const TOOL_ACCESS_BY_WORKFLOW: Record<string, string[]> = {
  'inicio_actividades_sii': ['consultar_sii', 'update_workflow_state'],
  'cobranza_tgr': ['consultar_tgr', 'update_workflow_state'],
  'f29_sii': ['consultar_f29_sii', 'update_workflow_state']
};

// B. CAPA DE POLÍTICAS Y SANITIZACIÓN (Tool Policy Layer)
const ToolPolicyLayer = {
  validateAndSanitize: (name: string, input: any, activeWorkflow: string): any => {
    const allowedTools = TOOL_ACCESS_BY_WORKFLOW[activeWorkflow] || ['update_workflow_state'];
    if (!allowedTools.includes(name)) {
      throw new Error(`Acceso denegado: La herramienta [${name}] no está autorizada para el flujo [${activeWorkflow}].`);
    }
    if (input.rut) {
      input.rut = input.rut.replace(/\./g, '').toUpperCase();
      if (!/^[0-9]+-[0-9K]$/.test(input.rut)) throw new Error('Estructura de RUT inválida para canales fiscales.');
    }
    return input;
  },
  calculateConfidenceDecay: (baseScore: number, lastVerifiedAt: string): number => {
    if (!lastVerifiedAt) return baseScore;
    const minutesElapsed = (Date.now() - new Date(lastVerifiedAt).getTime()) / 60000;
    const decay = 0.01 * minutesElapsed;
    return Math.max(0.1, parseFloat((baseScore - decay).toFixed(2)));
  }
};

// C. FUNCIÓN INTERNA DE SCRAPING SII (Proxy al microservicio backend en Render)
async function consultarSII(rut: string, correlationId: string): Promise<any> {
  const res = await fetch(`${process.env.SCRAPER_URL}/api/sii/basicos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.SCRAPER_API_KEY || '',
      'X-Correlation-ID': correlationId
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

async function declararF29SII(rut: string, periodo: string, codigos: any[], correlationId: string): Promise<any> {
  const res = await fetch(`${process.env.SCRAPER_URL}/api/sii/f29`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.SCRAPER_API_KEY || '',
      'X-Correlation-ID': correlationId
    },
    body: JSON.stringify({ rut, periodo, codigos }),
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detalle || `Error en scraper F29: ${res.statusText}`);
  }
  return await res.json();
}

export async function procesarTurnoCognitivoSoberano(
  sessionId: string, 
  userId: string, 
  nuevoMensaje: string,
  parentCorrelationId?: string
) {
  const modelName = 'claude-3-5-sonnet-20241022';
  const workflowVersion = 'v2-gold';
  
  // 4. CORRELATION ID LAYER: Propagación de trazabilidad vertical en producción
  const correlationId = parentCorrelationId || crypto.randomUUID();
  
  // 2. LÍMITE DURO DE ITERACIONES AGÉNTICAS: Control de oscilación y degradación de tokens
  const MAX_TOOL_ITERATIONS = 6;
  let toolIterationCount = 0;

  try {
    console.log(`[CORRELATION_ID: ${correlationId}] Iniciando turno para sesión: ${sessionId}`);

    // EXCLUSIÓN CONCURRENTE FUERTE (Advisory Lock Postgres - Tolerante si no existe la RPC)
    try {
      const { error: lockError } = await supabase.rpc('adquirir_advisory_lock_sesion', { target_session_id: sessionId });
      if (lockError) {
        console.warn(`Race Condition / Lock issue: ${lockError.message}`);
      }
    } catch (e: any) {
      console.warn(`La RPC adquirir_advisory_lock_sesion no está disponible aún. Continuando sin lock.`, e.message);
    }

    // REHIDRATACIÓN DE CONTEXTO Y ESTADO
    const { data: session } = await supabase.from('chat_sessions').select('*').eq('id', sessionId).single();
    if (!session) throw new Error('Sesión no encontrada en el almacenamiento relacional.');

    const activeWorkflow = session.workflow_type || 'inicio_actividades_sii';
    const etapaActualBase = session.current_stage || 'inicial';

    // Aplicar decaimiento de confianza
    const dynamicConfidence = ToolPolicyLayer.calculateConfidenceDecay(Number(session.confidence_score || 1.0), session.last_verified_at);

    const { data: dbMessages } = await supabase.from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(6);

    const messageHistory = dbMessages ? [...dbMessages].reverse() : [];
    const operationalContext = `[ESTADO_OPERACIONAL] Flujo: ${activeWorkflow}. Etapa: ${etapaActualBase}. Confianza Base: ${dynamicConfidence}. Requisitos Faltantes: ${JSON.stringify(session.missing_requirements || [])}.`;
    
    const messages = [
      { role: 'user', content: operationalContext },
      ...messageHistory.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: nuevoMensaje }
    ];

    const herramientasSistema = [
      {
        name: 'consultar_sii',
        description: 'Extrae datos de inicio de actividades vigentes en el SII usando el RUT.',
        input_schema: {
          type: 'object',
          properties: { rut: { type: 'string', description: 'RUT chileno con guión (ej: 76001382-K)' } },
          required: ['rut']
        }
      },
      {
        name: 'consultar_f29_sii',
        description: 'Realiza la declaración mensual Formulario 29 en el SII para el RUT, periodo y códigos indicados.',
        input_schema: {
          type: 'object',
          properties: {
            rut: { type: 'string', description: 'RUT chileno con guión (ej: 76001382-K)' },
            periodo: { type: 'string', description: 'Periodo a declarar en formato MM-YYYY (ej: 04-2026)' },
            codigos: {
              type: 'array',
              description: 'Códigos tributarios opcionales con sus montos (ej: [{ codigo: 538, monto: 15000 }])',
              items: {
                type: 'object',
                properties: {
                  codigo: { type: 'integer', description: 'Código F29 (ej: 538)' },
                  monto: { type: 'integer', description: 'Monto en pesos chilenos (ej: 15000)' }
                },
                required: ['codigo', 'monto']
              }
            }
          },
          required: ['rut', 'periodo']
        }
      },
      {
        name: 'update_workflow_state',
        description: 'Mutación determinista del estado de la máquina burocrática.',
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
      system: getSystemPrompt(),
      messages: messages as any,
      tools: herramientasSistema as any
    });

    const activeMessages = [...messages];

    // 3. AGENTIC TOOL LOOP (Bucle controlado con límites de seguridad distributivos)
    while (response.stop_reason === 'tool_use') {
      toolIterationCount++;
      
      // Control de pánico por bucle infinito u oscilación de herramientas
      if (toolIterationCount > MAX_TOOL_ITERATIONS) {
        await registrarMetricaTelemetria(sessionId, correlationId, 'agentic_loop_exceeded', { iterations: toolIterationCount });
        throw new Error(`Excedido el límite máximo de iteraciones agénticas permitidas (${MAX_TOOL_ITERATIONS}) para evitar degradación de tokens.`);
      }

      activeMessages.push({ role: 'assistant', content: response.content as any });
      const toolResults: any[] = [];

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const { name: toolName, input: toolInput, id: toolUseId } = block;
          let resultPayload: any = {};
          const inicioTiempoTool = Date.now();

          try {
            // Aplicar Capa de Políticas antes de interactuar con el exterior o la base de datos
            const sanitizedInput = ToolPolicyLayer.validateAndSanitize(toolName, toolInput, activeWorkflow);

            if (toolName === 'update_workflow_state') {
              const etapaPropuesta = sanitizedInput.current_stage;
              
              if (!verificarTransicionEstado(etapaActualBase, etapaPropuesta) && etapaActualBase !== etapaPropuesta) {
                throw new Error(`Transición ilegal rechazada por el Grafo de Control: [${etapaActualBase} -> ${etapaPropuesta}].`);
              }

              // 3. CAMBIO CRÍTICO: SHA-256 para Blindaje de Idempotencia Soberana
              const incomingHash = crypto
                .createHash('sha256')
                .update(JSON.stringify(sanitizedInput))
                .digest('hex');
              
              if (session.state_hash === incomingHash) {
                resultPayload = { status: "skipped", reason: "duplicate_transition" };
              } else {
                const newEvent = {
                  from_stage: session.current_stage || 'inicial',
                  to_stage: etapaPropuesta,
                  trigger: toolName,
                  timestamp: new Date().toISOString()
                };

                await supabase.from('chat_sessions').update({
                  current_stage: etapaPropuesta,
                  workflow_type: sanitizedInput.workflow_type,
                  completion_percentage: sanitizedInput.completion_percentage,
                  confidence_score: sanitizedInput.confidence_score,
                  missing_requirements: sanitizedInput.missing_requirements,
                  risk_flags: sanitizedInput.risk_flags,
                  last_tool_used: toolName,
                  state_hash: incomingHash,
                  event_history: [...(session.event_history as any || []), newEvent],
                  last_verified_at: new Date().toISOString(),
                  workflow_version: workflowVersion
                }).eq('id', sessionId);

                resultPayload = { status: "state_mutated_successfully", hash: incomingHash };
              }
            } 
            else if (toolName === 'consultar_sii') {
              resultPayload = await consultarSII(sanitizedInput.rut, correlationId);
            }
            else if (toolName === 'consultar_f29_sii') {
              resultPayload = await declararF29SII(sanitizedInput.rut, sanitizedInput.periodo, sanitizedInput.codigos || [], correlationId);
            }

            // 5. REGISTRO DE TELEMETRÍA Y COSTO DE TOKENS (Snapshot de la ejecución de la herramienta)
            const runtimeTool = Date.now() - inicioTiempoTool;
            await supabase.from('compliance_audit_log').insert({
              session_id: sessionId,
              user_id: userId,
              event_type: toolName === 'update_workflow_state' ? 'state_mutation' : 'tool_execution',
              tool_name: toolName,
              tool_input: toolInput,
              tool_output: resultPayload,
              llm_model: modelName,
              risk_snapshot: sanitizedInput.risk_flags || session.risk_flags,
              workflow_version: workflowVersion,
              correlation_id: correlationId,
              token_input_count: response.usage?.input_tokens || 0,
              token_output_count: response.usage?.output_tokens || 0,
              tool_iteration_count: toolIterationCount,
              runtime_ms: runtimeTool
            });

          } catch (error: any) {
            console.error(`[CORRELATION_ID: ${correlationId}] Error en herramienta [${toolName}]: ${error.message}`);
            resultPayload = { error: true, code: "POLICY_OR_RUNTIME_VIOLATION", message: error.message };
          }

          toolResults.push({ type: 'tool_result', tool_use_id: toolUseId, content: JSON.stringify(resultPayload) });
        }
      }

      activeMessages.push({ role: 'user', content: toolResults as any });

      response = await anthropic.messages.create({
        model: modelName,
        max_tokens: 2000,
        system: getSystemPrompt(),
        messages: activeMessages as any,
        tools: herramientasSistema as any
      });
    }

    const finalResponseText = response.content[0].type === 'text' ? response.content[0].text : 'Sincronización terminada.';
    await supabase.from('chat_messages').insert({ session_id: sessionId, role: 'assistant', content: finalResponseText });
    
    return finalResponseText;

  } catch (error: any) {
    console.error(`[FATAL RUNTIME EXCEPTION][CORRELATION_ID: ${correlationId}] ${error.message}`);
    return "Detectamos una anomalía temporal de sincronización en tu sesión. Tu progreso histórico e institucional está completamente resguardado encriptadamente. Por favor, refresca e intenta de nuevo en unos segundos.";
  }
}

async function registrarMetricaTelemetria(sessionId: string, correlationId: string, eventType: string, payload: any) {
  console.log(`[TELEMETRIA_CRITICA][${correlationId}] Evento: ${eventType} | Payload: ${JSON.stringify(payload)}`);
}
