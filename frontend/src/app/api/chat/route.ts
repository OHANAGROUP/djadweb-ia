import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { processFlowAction } from '@/services/flowEngine';

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
    const { action, sessionId } = body; // changed 'message' to 'action' to allow commands

    if (!action || !action.trim()) {
      return NextResponse.json({ error: 'Acción requerida' }, { status: 400 });
    }

    // Buscar o inicializar la sesión en la DB si no existe
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sError } = await supabase.from('chat_sessions').insert({
        user_id: user.id,
        title: action.slice(0, 80),
        workflow_type: 'default',
        current_stage: 'inicial',
        confidence_score: 1.0,
        workflow_version: 'v3-flow'
      }).select('id').single();
      
      if (sError || !newSession) {
        throw new Error(`Error inicializando sesión: ${sError?.message}`);
      }
      currentSessionId = newSession.id;
    }

    // Invocar el motor de flujo procedimental
    const result = await processFlowAction(currentSessionId, user.id, action);

    return NextResponse.json({
      ...result,
      sessionId: currentSessionId
    });
  } catch (err: any) {
    console.error('Flow API error:', err);
    return NextResponse.json({
      error: 'Error interno del sistema',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}
