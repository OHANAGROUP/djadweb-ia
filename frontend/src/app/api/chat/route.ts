import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getMCPTools } from '@/lib/mcp/client';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPT = `Eres DJADWEB-IA, el asistente burocratico de Chile. Ayudas a personas y empresas a navegar tramites del Estado chileno usando datos en tiempo real del SII, Poder Judicial, TGR y otros organismos.

Reglas:
- Responde SIEMPRE en espanol chileno, claro y cercano.
- Si el usuario pregunta por un tramite, usa las herramientas disponibles para consultar datos en vivo.
- Si no tienes una herramienta para responder, indicalo honestamente.
- Proporciona pasos accionables y claros.
- Se profesional pero amigable, como un gestor experimentado.
- Cuando muestres datos de causas o deudas, explica en lenguaje simple que significan.
- Sugerencias de proximos pasos al final de cada respuesta.`;

async function executeToolCall(toolName: string, toolInput: any, apiKey: string): Promise<any> {
  switch (toolName) {
    case 'consultar_pjud': {
      const res = await fetch(`${process.env.SCRAPER_URL}/api/pjud/nombre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
        body: JSON.stringify(toolInput),
        signal: AbortSignal.timeout(45000)
      });
      if (!res.ok) throw new Error(`PJUD error: ${res.statusText}`);
      return res.json();
    }
    case 'consultar_sii': {
      const res = await fetch(`${process.env.SCRAPER_URL}/api/sii/basicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
        body: JSON.stringify({ rut: toolInput.rut }),
        signal: AbortSignal.timeout(30000)
      });
      if (!res.ok) throw new Error(`SII error: ${res.statusText}`);
      return res.json();
    }
    case 'consultar_tgr': {
      const res = await fetch(`${process.env.SCRAPER_URL}/api/tgr/deuda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
        body: JSON.stringify({ rut: toolInput.rut }),
        signal: AbortSignal.timeout(30000)
      });
      if (!res.ok) throw new Error(`TGR error: ${res.statusText}`);
      return res.json();
    }
    case 'consultar_alertas': {
      const supabase = await createClient();
      const { data } = await supabase.from('alerts').select('*').eq('user_id', toolInput.userId || '').limit(toolInput.limit || 10);
      return data || [];
    }
    default:
      return { error: `Herramienta desconocida: ${toolName}` };
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { message, sessionId, history } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    // Get MCP tool definitions based on plan
    const mcpTools = await getMCPTools(user.id);

    // Build conversation history (without system prompt)
    const messages: Anthropic.Messages.MessageParam[] = [
      ...(history || []).filter((m: any) => m.role !== 'system'),
      { role: 'user', content: message }
    ];

    // Crea o busca sesion
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession } = await supabase.from('chat_sessions').insert({
        user_id: user.id,
        title: message.slice(0, 80)
      }).select('id').single();
      currentSessionId = newSession?.id;
    }

    // Tool calling loop - max 5 rounds to prevent infinite loops
    let finalContent = '';
    let currentMessages = [...messages];

    for (let round = 0; round < 5; round++) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: currentMessages,
        tools: mcpTools as any,
      });

      // Check if any tool calls were made
      const toolUseBlocks = response.content.filter((block: any): block is any => block.type === 'tool_use');

      // Add assistant response to messages
      const assistantContent: any[] = [];
      for (const block of response.content) {
        if (block.type === 'text') {
          finalContent = block.text;
          assistantContent.push({ type: 'text', text: block.text });
        } else if (block.type === 'tool_use') {
          assistantContent.push({
            type: 'tool_use',
            id: block.id,
            name: block.name,
            input: block.input
          });
        }
      }

      currentMessages.push({ role: 'assistant', content: assistantContent });

      // If no tool calls, we're done
      if (toolUseBlocks.length === 0) break;

      // Execute each tool and add results
      for (const toolBlock of toolUseBlocks) {
        const tb: any = toolBlock;
        const toolResult = await executeToolCall(
          tb.name,
          tb.input,
          process.env.SCRAPER_API_KEY || ''
        );

        currentMessages.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: tb.id,
            content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)
          }]
        });
      }
    }

    // Save to chat history
    if (currentSessionId) {
      const timestamp = new Date().toISOString();
      await supabase.from('chat_messages').insert([
        { session_id: currentSessionId, role: 'user', content: message },
        { session_id: currentSessionId, role: 'assistant', content: finalContent || 'No se pudo generar respuesta' }
      ]);
      await supabase.from('chat_sessions').update({
        message_count: Math.floor(currentMessages.length / 2),
        updated_at: timestamp
      }).eq('id', currentSessionId);
    }

    return NextResponse.json({
      content: finalContent || 'No se pudo generar respuesta',
      role: 'assistant',
      sessionId: currentSessionId
    });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json({
      error: 'Error interno del asistente',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}
