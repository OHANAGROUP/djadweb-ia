// src/core/guardian/rollbackEngine.ts
/**
 * RollbackEngine — Motor de Reversión Segura e Inmutable de Estados.
 *
 * Reposiciona los punteros operacionales de la sesión al último paso verificado,
 * respetando la inmutabilidad y supremacía del Event Store (sin borrar eventos).
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { SessionEngine, Session, SessionEvent } from '@/core/session-engine/sessionEngine'

export class RollbackEngine {
  private supabase: SupabaseClient
  private sessionEngine: SessionEngine

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
    this.sessionEngine = new SessionEngine(supabaseClient)
  }

  /**
   * Ejecuta el rollback de la sesión madre al último paso seguro e inalterado.
   */
  public async rollbackToLastSafe(
    sessionId: string,
    userId: string,
    lastSafeIndex: number
  ): Promise<Session> {
    const { session, events } = await this.sessionEngine.resumeSession(sessionId)

    if (lastSafeIndex < 0 || events.length === 0) {
      const firstStep = 'onboarding'
      await this.supabase
        .from('tramite_sessions')
        .update({
          current_step: firstStep,
          progress: 0,
          status: 'active',
        })
        .eq('id', sessionId)

      await this.sessionEngine.addEvent(sessionId, userId, 'STEP_REGRESSED', {
        previousStep: session.current_step,
        currentStep: firstStep,
        progress: 0,
        reason: 'Rollback a estado inicial por corrupción de cadena.',
      })

      const { session: freshSession } = await this.sessionEngine.resumeSession(sessionId)
      return freshSession
    }

    let safeStep = 'onboarding'
    let safeProgress = 0

    // Replay secuencial hasta el índice seguro para obtener el paso y progreso correspondientes
    for (let i = 0; i <= lastSafeIndex; i++) {
      const e = events[i]
      if (e.type === 'STEP_ADVANCED') {
        safeStep = e.payload.currentStep
        safeProgress = e.payload.progress
      } else if (e.type === 'TRAMITE_STARTED') {
        safeStep = e.payload.starting_step
        safeProgress = 0
      } else if (e.type === 'STEP_REGRESSED') {
        safeStep = e.payload.currentStep
        safeProgress = e.payload.progress
      }
    }

    // Actualizar punteros de la sesión madre
    await this.supabase
      .from('tramite_sessions')
      .update({
        current_step: safeStep,
        progress: safeProgress,
        status: 'active', // Reactivar sesión tras el rollback
      })
      .eq('id', sessionId)

    // Escribir evento inmutable de reversión
    await this.sessionEngine.addEvent(sessionId, userId, 'STEP_REGRESSED', {
      previousStep: session.current_step,
      currentStep: safeStep,
      progress: safeProgress,
      reason: `Rollback seguro de sistema al índice de evento ${lastSafeIndex}.`,
    })

    const { session: freshSession } = await this.sessionEngine.resumeSession(sessionId)
    return freshSession
  }

  /**
   * Ejecuta un rollback inteligente basado en la clasificación del desvío (DriftType).
   * Resguarda estrictamente la inmutabilidad y previene re-ejecutar efectos secundarios nocivos (UNSAFE).
   */
  public async rollbackByDrift(
    sessionId: string,
    userId: string,
    driftType: string,
    lastSafeIndex: number
  ): Promise<Session> {
    const { session, events } = await this.sessionEngine.resumeSession(sessionId)

    // Regla crítica: Cero re-ejecución de efectos secundarios nocivos
    const unsafeTypes = ['PAYMENT', 'SIGNATURE', 'EXTERNAL_SUBMISSION']
    const hasUnsafeEvents = events.slice(lastSafeIndex + 1).some(e => 
      unsafeTypes.some(type => e.type.includes(type))
    )

    if (hasUnsafeEvents) {
      console.warn(
        `[RollbackEngine] ALERTA CRÍTICA: Se detectaron eventos de efectos secundarios (UNSAFE) en el rango de rollback (${driftType}). Se mantendrán inalterados en el ledger sin re-ejecución.`
      )
    }

    // Ejecutar el rollback utilizando la lógica base determinista
    const updatedSession = await this.rollbackToLastSafe(sessionId, userId, lastSafeIndex)

    // Guardar en el log del guardián o metadata
    await this.supabase.from('guardian_state').upsert({
      session_id: sessionId,
      state: 'active',
      last_safe_event_index: lastSafeIndex,
      updated_at: new Date().toISOString()
    })

    return updatedSession
  }
}
