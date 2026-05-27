import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { procesarMensajeChat } from '@/services/copilot';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { message, sessionId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    // Buscar o inicializar la sesión en la DB si no existe
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sError } = await supabase.from('chat_sessions').insert({
        user_id: user.id,
        title: message.slice(0, 80),
        workflow_type: 'inicio_actividades_sii',
        current_stage: 'inicial',
        confidence_score: 1.0,
        workflow_version: 'v2'
      }).select('id').single();
      
      if (sError || !newSession) {
        throw new Error(`Error inicializando sesión: ${sError?.message}`);
      }
      currentSessionId = newSession.id;
    }

    // Invocar el procesador de turno del asistente tributario
    const finalContent = await procesarMensajeChat(currentSessionId, user.id, message);

    return NextResponse.json({
      content: finalContent,
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
