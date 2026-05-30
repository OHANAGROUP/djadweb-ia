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
import { DriftClassifier } from './driftClassifier'
import { SafeStateRegistry } from './safeStateRegistry'
import { AuditEngine } from '@/core/audit-engine/auditEngine'
import { InvariantRegistry, InvariantViolation } from './invariantRegistry'
import { ProofLogger } from './proofLogger'

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
  private classifier: DriftClassifier
  private safeRegistry: SafeStateRegistry
  private auditEngine: AuditEngine
  private invariantRegistry: InvariantRegistry
  private watchdogIntervals: Map<string, NodeJS.Timeout> = new Map()
  private watchdogChannels: Map<string, any> = new Map()

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
    this.sessionEngine = new SessionEngine(supabaseClient)
    this.integrityMonitor = new IntegrityMonitor(supabaseClient)
    this.firewall = new IdempotencyFirewall(supabaseClient)
    this.driftDetector = new DriftDetector(supabaseClient)
    this.rollbackEngine = new RollbackEngine(supabaseClient)
    this.classifier = new DriftClassifier()
    this.safeRegistry = new SafeStateRegistry(supabaseClient)
    this.auditEngine = new AuditEngine(supabaseClient)
    this.invariantRegistry = new InvariantRegistry()
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
   * Inicia el bucle de Watchdog continuo reactivo/periódico para una sesión.
   * Ejecuta validaciones cada `intervalMs` (por defecto 2000ms).
   */
  public initWatchdog(sessionId: string, userId: string, intervalMs: number = 2000): void {
    if (this.watchdogIntervals.has(sessionId)) {
      return
    }

    // 1. Suscribirse a cambios en tiempo real si el cliente lo soporta
    if (typeof this.supabase.channel === 'function') {
      const channel = this.supabase
        .channel(`watchdog-${sessionId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tramite_session_events', filter: `session_id=eq.${sessionId}` },
          async (payload: any) => {
            console.log(`[Watchdog] Cambio reactivo detectado en tramite_session_events para ${sessionId}`)
            await this.validateSession(sessionId, userId)
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'guardian_state', filter: `session_id=eq.${sessionId}` },
          async (payload: any) => {
            console.log(`[Watchdog] Cambio reactivo detectado en guardian_state para ${sessionId}`)
            await this.validateSession(sessionId, userId)
          }
        )
        .subscribe()

      this.watchdogChannels.set(sessionId, channel)
    }

    // 2. Loop de control continuo periódico (supervisión activa cada 2-5 segundos)
    const interval = setInterval(async () => {
      try {
        await this.validateSession(sessionId, userId)
      } catch (err: any) {
        console.error(`[Watchdog] Error en loop periódico para ${sessionId}: ${err.message}`)
      }
    }, intervalMs)

    this.watchdogIntervals.set(sessionId, interval)
  }

  /**
   * Detiene el Watchdog para una sesión.
   */
  public stopWatchdog(sessionId: string): void {
    const interval = this.watchdogIntervals.get(sessionId)
    if (interval) {
      clearInterval(interval)
      this.watchdogIntervals.delete(sessionId)
    }

    const channel = this.watchdogChannels.get(sessionId)
    if (channel) {
      if (typeof channel.unsubscribe === 'function') {
        channel.unsubscribe()
      }
      this.watchdogChannels.delete(sessionId)
    }
  }

  /**
   * Valida en tiempo real la consistencia criptográfica y operacional de la sesión.
   */
  public async validateSession(sessionId: string, userId: string): Promise<GuardianControlResult> {
    const { session, events } = await this.sessionEngine.resumeSession(sessionId)

    // A. Evaluar expiración del TTL de continuidad (Revalidación obligatoria > 24 horas)
    const lastActive = new Date(session.last_active_at).getTime()
    const elapsed = Date.now() - lastActive
    if (elapsed > 24 * 60 * 60 * 1000 && !session.requires_revalidation) {
      console.warn(`[RuntimeGuardian] Alerta de TTL: Sesión inactiva por más de 24 horas. Marcando para revalidación externa.`)
      session.requires_revalidation = true
      await this.supabase
        .from('tramite_sessions')
        .update({ requires_revalidation: true })
        .eq('id', sessionId)
    }

    // B. Monitorear integridad del Ledger (SHA-256 Chain + Index Monotonicity)
    const integrity = await this.integrityMonitor.validateSession(sessionId)
    if (integrity.status === 'CORRUPTED') {
      console.warn(`[RuntimeGuardian] CORRUPCIÓN EN LEDGER DETECTADA en sesión ${sessionId}. Congelando...`)
      
      const frozenSession = await this.freezeSession(sessionId)
      
      // Aplicar rollback seguro inmutable al último Safe Point
      const safeIndex = integrity.lastValidIndex >= 0 ? integrity.lastValidIndex : 0
      const recoveredSession = await this.rollbackEngine.rollbackByDrift(
        sessionId,
        userId,
        'CHAIN_CORRUPTION',
        safeIndex
      )

      await this.supabase
        .from('guardian_state')
        .upsert({
          session_id: sessionId,
          state: 'rollback_required',
          last_safe_event_index: safeIndex,
          last_integrity_hash: integrity.expectedHash,
          updated_at: new Date().toISOString(),
        })

      return {
        action: 'FROZEN_ROLLBACK',
        message: `Cadena corrupta detectada. Rollback inmutable al evento ${safeIndex}.`,
        session: recoveredSession,
      }
    }

    // C. Monitorear derivas estructurales o externas (Drift)
    const drift = await this.driftDetector.checkDrift(session, events)
    if (drift.detected) {
      const suggestedAction = drift.classification?.suggested_action || 'freeze'

      if (suggestedAction === 'freeze' || drift.severity === 'CRITICAL') {
        console.warn(`[RuntimeGuardian] DESVÍO CRÍTICO/CONGELAMIENTO DETECTADO en sesión ${sessionId}. Tipo: ${drift.type}. Congelando...`)
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

      if (suggestedAction === 'rollback') {
        console.warn(`[RuntimeGuardian] DESVÍO REQUERIDO DE ROLLBACK en sesión ${sessionId}. Tipo: ${drift.type}. Aplicando rollback...`)
        const lastSafe = events.length > 2 ? events.length - 2 : 0
        const recoveredSession = await this.rollbackEngine.rollbackByDrift(
          sessionId,
          userId,
          drift.type || 'STATE_DRIFT',
          lastSafe
        )

        return {
          action: 'FROZEN_ROLLBACK',
          message: `Desvío solucionado con rollback al índice ${lastSafe}: ${drift.details}`,
          session: recoveredSession,
        }
      }
    }

    // Registrar checkpoint seguro en el registro central
    if (events.length > 0) {
      const lastEvent = events[events.length - 1]
      await this.safeRegistry.registerSafeState(
        sessionId,
        session.current_step,
        lastEvent.hash,
        lastEvent.event_index.toString()
      )
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
   * Evalúa de forma formal y determinista las invariantes operacionales del sistema (FVL Layer).
   * Admite DRY-RUN (para simulación y CI) y LIVE (para producción con penalización).
   */
  public async evaluateInvariants(
    sessionId: string,
    userId: string,
    event: { type: string; payload?: any },
    mode: 'dry-run' | 'live' = 'live'
  ): Promise<{
    passed: boolean
    violations: InvariantViolation[]
    riskScore: number
    predictedState?: any
  }> {
    const { session, events } = await this.sessionEngine.resumeSession(sessionId)

    // Evaluar contra el registro central de invariantes
    const violations = this.invariantRegistry.evaluate(session, {
      type: event.type,
      payload: event.payload,
      events,
    })

    const passed = violations.length === 0
    const criticalViolations = violations.filter(v => v.severity === 'critical')
    const riskScore = passed
      ? 0
      : criticalViolations.length * 50 + (violations.length - criticalViolations.length) * 20

    // Calcular predicted state si aplica (Dry-run simulación)
    let predictedState = null
    if (mode === 'dry-run') {
      predictedState = {
        sessionId,
        currentStep: session.current_step,
        proposedEvent: event.type,
        action: passed ? 'PROCEED' : violations[0].violationAction.toUpperCase(),
        riskScore,
      }
    }

    // Registrar en Obsidian Sync
    const lastEvent = events[events.length - 1]
    await ProofLogger.logProof({
      sessionId,
      eventId: event.payload?.transactionId || event.payload?.eventId || `evt-${event.type}-${Date.now()}`,
      eventType: event.type,
      invariantsEvaluated: ['R1_ABS_IDEMPOTENCY', 'R2_TERMINAL_DRIFT', 'R3_CONTINUITY_OVERRIDE', 'R4_ROLLBACK_SAFETY'],
      passed,
      violations,
      hashStateBefore: lastEvent ? lastEvent.hash : null,
      hashStateAfter: lastEvent && passed ? lastEvent.hash : null,
      timestamp: new Date().toISOString(),
    })

    if (!passed && mode === 'live') {
      console.error(`[RuntimeGuardian] VIOLACIÓN DE INVARIANTE DETECTADA en modo LIVE: ${violations[0].description}`)
      await this.handleViolation(sessionId, userId, violations[0])
    }

    return {
      passed,
      violations,
      riskScore,
      ...(predictedState ? { predictedState } : {}),
    }
  }

  /**
   * Gestiona activamente una violación de invariante detectada en LIVE.
   */
  public async handleViolation(
    sessionId: string,
    userId: string,
    violation: InvariantViolation
  ): Promise<void> {
    if (violation.violationAction === 'block') {
      console.warn(`[RuntimeGuardian] Aplicando BLOCK/FREEZE sobre la sesión ${sessionId} por violación de ${violation.invariantId}`)
      await this.freezeSession(sessionId)
      await this.supabase.from('guardian_state').upsert({
        session_id: sessionId,
        state: 'frozen',
        updated_at: new Date().toISOString(),
      })
    } else if (violation.violationAction === 'rollback') {
      console.warn(`[RuntimeGuardian] Aplicando ROLLBACK en caliente sobre la sesión ${sessionId} por violación de ${violation.invariantId}`)
      await this.freezeSession(sessionId)
      
      const { events } = await this.sessionEngine.resumeSession(sessionId)
      const lastSafe = events.length > 2 ? events.length - 2 : 0
      await this.rollbackEngine.rollbackByDrift(sessionId, userId, violation.invariantId, lastSafe)
    }
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
