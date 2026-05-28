// frontend/src/app/api/chat/route.ts
/**
 * API Route Handler — Interceptor de interacciones y comandos de flujo.
 *
 * Utiliza SessionEngine para persistir el Ledger de Auditoría y el estado
 * rehidratable de las sesiones de trámite.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { processFlowAction } from '@/core/flow-engine/flowEngine'
import { SessionEngine } from '@/core/session-engine/sessionEngine'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { action, sessionId } = body

    if (!action || !action.trim()) {
      return NextResponse.json({ error: 'Acción requerida' }, { status: 400 })
    }

    // Inicializar el motor de sesiones en el servidor
    const sessionEngine = new SessionEngine(supabase)
    let currentSessionId = sessionId

    // Si no se provee ID, inicializar una sesión persistente vNext de trámite
    if (!currentSessionId) {
      const newSession = await sessionEngine.createSession(
        user.id,
        'default', // Trámite por defecto (se clasificará en el primer paso)
        'inicial', // Paso inicial de onboarding del flujo
        { title: action.slice(0, 80) }
      )
      currentSessionId = newSession.id
    }

    // Procesar la acción en el motor procedimental (FlowEngine)
    const result = await processFlowAction(currentSessionId, user.id, action)

    // Sincronizar con Obsidian en segundo plano
    try {
      const { ObsidianSync } = await import('@/core/session-engine/obsidianSync')
      const { AuditEngine } = await import('@/core/audit-engine/auditEngine')
      
      const { session: updatedSession, events: updatedEvents } = await sessionEngine.resumeSession(currentSessionId)
      await ObsidianSync.syncSession(updatedSession, updatedEvents)
      
      // Si la sesión finalizó, realizar reporte de auditoría completo
      if (result.type === 'flow_completed') {
        const auditEngine = new AuditEngine(supabase)
        const integrity = await auditEngine.verifySessionIntegrity(currentSessionId)
        await ObsidianSync.syncAuditReport(updatedSession, integrity)
      }
    } catch (syncErr) {
      console.error('[ObsidianSync] Failed to sync session:', syncErr)
    }

    return NextResponse.json({
      ...result,
      sessionId: currentSessionId,
    })
  } catch (err: any) {
    console.error('Flow API vNext error:', err)
    return NextResponse.json({
      error: 'Error interno del sistema',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    }, { status: 500 })
  }
}
