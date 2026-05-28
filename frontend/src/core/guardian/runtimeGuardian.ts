// src/core/guardian/runtimeGuardian.ts
/**
 * RuntimeGuardian — Supervisor Operacional y Control Loop de Seguridad.
 *
 * Centraliza la toma de decisiones del Guardián: orquesta la verificación criptográfica,
 * detiene el flujo ante desvíos críticos, bloquea eventos redundantes y aplica rollbacks.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { SessionEngine, Session } from '@/core/session-engine/sessionEngine'
import { IntegrityMonitor } from './integrityMonitor'
import { IdempotencyFirewall } from './idempotencyFirewall'
import { DriftDetector } from './driftDetector'
import { RollbackEngine } from './rollbackEngine'

export interface GuardianControlResult {
  action: 'PROCEED' | 'BLOCKED' | 'FROZEN_ROLLBACK' | 'FROZEN_DRIFT'
  message: string
  session?: Session
}

export class RuntimeGuardian {
  private supabase: SupabaseClient
  private sessionEngine: SessionEngine
  private integrityMonitor: IntegrityMonitor
  private firewall: IdempotencyFirewall
  private driftDetector: DriftDetector
  private rollbackEngine: RollbackEngine

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
    this.sessionEngine = new SessionEngine(supabaseClient)
    this.integrityMonitor = new IntegrityMonitor(supabaseClient)
    this.firewall = new IdempotencyFirewall(supabaseClient)
    this.driftDetector = new DriftDetector(supabaseClient)
    this.rollbackEngine = new RollbackEngine(supabaseClient)
  }

  /**
   * Inicializa la supervisión del estado del guardián en base de datos.
   */
  public async initGuardian(sessionId: string): Promise<void> {
    await this.supabase.from('guardian_state').upsert({
      session_id: sessionId,
      state: 'active',
      last_safe_event_index: 0,
      updated_at: new Date().toISOString(),
    })
  }

  /**
   * Valida en tiempo real la consistencia criptográfica y operacional de la sesión.
   */
  public async validateSession(sessionId: string, userId: string): Promise<GuardianControlResult> {
    const { session, events } = await this.sessionEngine.resumeSession(sessionId)

    // 1. Monitorear integridad del Ledger (SHA-256 Chain)
    const integrity = await this.integrityMonitor.validateSession(sessionId)
    if (integrity.status === 'CORRUPTED') {
      console.warn(`[RuntimeGuardian] CORRUPCIÓN EN LEDGER DETECTADA en sesión ${sessionId}. Congelando...`)
      
      const frozenSession = await this.freezeSession(sessionId)
      
      // Aplicar rollback seguro inmutable
      const recoveredSession = await this.rollbackEngine.rollbackToLastSafe(
        sessionId,
        userId,
        integrity.lastValidIndex
      )

      await this.supabase
        .from('guardian_state')
        .upsert({
          session_id: sessionId,
          state: 'rollback_required',
          last_safe_event_index: integrity.lastValidIndex,
          last_integrity_hash: integrity.expectedHash,
          updated_at: new Date().toISOString(),
        })

      return {
        action: 'FROZEN_ROLLBACK',
        message: `Cadena corrupta detectada. Rollback inmutable al evento ${integrity.lastValidIndex}.`,
        session: recoveredSession,
      }
    }

    // 2. Monitorear derivas estructurales o externas (Drift)
    const drift = await this.driftDetector.checkDrift(session, events)
    if (drift.detected && drift.severity === 'CRITICAL') {
      console.warn(`[RuntimeGuardian] DESVÍO CRÍTICO DETECTADO en sesión ${sessionId}. Congelando...`)
      
      const frozenSession = await this.freezeSession(sessionId)

      await this.supabase
        .from('guardian_state')
        .upsert({
          session_id: sessionId,
          state: 'frozen',
          last_safe_event_index: events.length - 1,
          updated_at: new Date().toISOString(),
        })

      return {
        action: 'FROZEN_DRIFT',
        message: `Flujo congelado por deriva crítica: ${drift.details}`,
        session: frozenSession,
      }
    }

    return {
      action: 'PROCEED',
      message: 'Todo en orden (OK).',
      session,
    }
  }

  /**
   * Controla la inyección de eventos y previene duplicaciones en caliente.
   */
  public async onEvent(
    sessionId: string,
    userId: string,
    eventType: string,
    payload: any = {}
  ): Promise<GuardianControlResult> {
    const safeTypes = [
      'SESSION_CREATED',
      'TRAMITE_STARTED',
      'STEP_REGRESSED',
      'HELP_REQUESTED',
      'LLM_CALLED',
      'USER_CHAT_RECEIVED',
      'LLM_ASSIST_RESPONDED',
      'EXTERNAL_STATE_SYNCHRONIZED',
      'EXTERNAL_STATE_DISCREPANCY_DETECTED',
    ]

    const isSafe = safeTypes.includes(eventType)

    // Si es un evento crítico/unsafe, filtrar con el firewall de idempotencia
    if (!isSafe) {
      const transactionId =
        payload?.transactionId || payload?.eventId || payload?.id || `tx-${eventType}-${Date.now()}`
      
      const canExecute = await this.firewall.shouldExecute(transactionId, sessionId)

      if (!canExecute) {
        console.warn(`[RuntimeGuardian] CORTAFUEGOS: Intento de doble ejecución bloqueado para "${eventType}".`)
        
        await this.firewall.markExecuted(
          transactionId,
          sessionId,
          'blocked',
          `Intento redundante bloqueado por el firewall de idempotencia.`
        )

        return {
          action: 'BLOCKED',
          message: `Ejecución redundante bloqueada por idempotencia para el evento: ${eventType}.`,
        }
      }

      await this.firewall.markExecuted(
        transactionId,
        sessionId,
        'executed',
        `Evento procesado con éxito.`
      )
    }

    return this.validateSession(sessionId, userId)
  }

  /**
   * Pausa de forma inmediata la sesión sospechosa.
   */
  public async freezeSession(sessionId: string): Promise<Session> {
    const { data, error } = await this.supabase
      .from('tramite_sessions')
      .update({ status: 'paused', last_active_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      throw new Error(`[RuntimeGuardian] Error congelando sesión: ${error.message}`)
    }

    return data as Session
  }

  /**
   * Reanuda la sesión activa.
   */
  public async resumeSession(sessionId: string): Promise<Session> {
    const { data, error } = await this.supabase
      .from('tramite_sessions')
      .update({ status: 'active', last_active_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      throw new Error(`[RuntimeGuardian] Error reanudando sesión: ${error.message}`)
    }

    return data as Session
  }
}
