// frontend/src/core/session-engine/continuityEngine.ts
/**
 * ContinuityEngine — Motor de Continuidad Operacional de Largo Plazo.
 *
 * Aplica políticas de expiración y rehidratación de sesión, controlando
 * la idempotencia de eventos y gatillando verificaciones de estado externo.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { SessionEngine, Session, SessionEvent } from './sessionEngine'
import { ExternalStateChecker } from './externalStateChecker'

const REVALIDATION_THRESHOLD_MS = 24 * 60 * 60 * 1000 // 24 Horas

export interface ContinuityReport {
  session: Session
  events: SessionEvent[]
  revalidated: boolean
  changesDetected: boolean
  log: string
}

export class ContinuityEngine {
  private supabase: SupabaseClient
  private sessionEngine: SessionEngine
  private stateChecker: ExternalStateChecker

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
    this.sessionEngine = new SessionEngine(supabaseClient)
    this.stateChecker = new ExternalStateChecker(supabaseClient)
  }

  /**
   * Rehidrata una sesión y aplica el control de re-validación temporal.
   */
  public async rehydrateAndValidateSession(
    sessionId: string,
    userId: string
  ): Promise<ContinuityReport> {
    const timestamp = new Date().toISOString()
    const { session, events } = await this.sessionEngine.resumeSession(sessionId)

    const lastActive = new Date(session.last_active_at).getTime()
    const elapsed = Date.now() - lastActive
    const exceedsThreshold = elapsed > REVALIDATION_THRESHOLD_MS
    const forceReval = session.requires_revalidation || false

    let revalidated = false
    let changesDetected = false
    let log = 'Sesión rehidratada dentro del límite de 24 horas (OK).'

    if (exceedsThreshold || forceReval) {
      console.log(`[ContinuityEngine] Expiración o fuerza detectada. Gatillando re-verificación externa...`)
      
      const checkResult = await this.stateChecker.verifyExternalState(
        session.tramite_id,
        userId,
        session.session_metadata
      )

      revalidated = true
      log = checkResult.revalidationLog

      // 1. Guardar auditoría temporal del check en la DB
      await this.supabase
        .from('tramite_sessions')
        .update({
          last_external_check: timestamp,
          requires_revalidation: false,
        })
        .eq('id', sessionId)

      // 2. Si detectamos discrepancias del mundo real
      if (checkResult.changed) {
        changesDetected = true
        
        // Registrar evento de discrepancia en el Ledger criptográfico
        await this.sessionEngine.addEvent(sessionId, userId, 'EXTERNAL_STATE_DISCREPANCY_DETECTED', {
          log: checkResult.revalidationLog,
          details: checkResult.details,
          checked_at: checkResult.timestamp,
        })

        // Guardar cambios del SII/PJUD en el metadata de la sesión
        const updatedMetadata = {
          ...session.session_metadata,
          externalSyncDetails: checkResult.details,
          requiresStepRegression: true, // Forzar a que la UI alerte al usuario
        }

        await this.supabase
          .from('tramite_sessions')
          .update({
            session_metadata: updatedMetadata,
          })
          .eq('id', sessionId)
      } else {
        // Registrar evento de check exitoso sin variaciones
        await this.sessionEngine.addEvent(sessionId, userId, 'EXTERNAL_STATE_SYNCHRONIZED', {
          log: checkResult.revalidationLog,
          checked_at: checkResult.timestamp,
        })
      }
    }

    // Retornar sesión fresca con su historial actualizado
    const freshData = await this.sessionEngine.resumeSession(sessionId)

    return {
      session: freshData.session,
      events: freshData.events,
      revalidated,
      changesDetected,
      log,
    }
  }

  /**
   * Regla de Idempotencia de Eventos.
   * Indica si un evento puede volverse a procesar de forma segura o si es crítico y no-idempotente.
   */
  public static isEventIdempotent(eventType: string): boolean {
    const safeEvents = [
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

    // Eventos críticos como firmas, webhooks de cobros, o llamadas a Render que ejecutan acciones
    const criticalEvents = [
      'PAYMENT_COMPLETED',
      'DOCUMENT_SIGNED',
      'EMAIL_SENT',
      'SII_FORM_SUBMITTED',
      'TGR_DEBT_PAID',
    ]

    if (criticalEvents.includes(eventType)) {
      return false
    }

    return safeEvents.includes(eventType)
  }
}
