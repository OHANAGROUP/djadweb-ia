// frontend/src/services/auditEngine.ts
/**
 * AuditEngine — Motor de Verificación de Integridad Criptográfica del Ledger.
 *
 * Se encarga de verificar que la cadena de auditoría (Audit Chain) de eventos
 * de una sesión de trámite no haya sido manipulada, alterada o corrompida.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { SessionEngine, SessionEvent } from '@/core/session-engine/sessionEngine'

export class AuditEngine {
  private supabase: SupabaseClient

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  /**
   * Verifica la integridad criptográfica completa de la cadena de eventos de una sesión.
   *
   * Compara los hashes de forma encadenada:
   * 1. Re-calcula el hash SHA-256 de cada evento con sus campos.
   * 2. Compara el hash re-calculado con el hash guardado en base de datos.
   * 3. Compara el `previous_hash` con el `hash` del evento anterior.
   */
  public async verifySessionIntegrity(sessionId: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // 1. Obtener todos los eventos ordenados por event_index
    const { data: events, error } = await this.supabase
      .from('tramite_session_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('event_index', { ascending: true })

    if (error) {
      return {
        valid: false,
        errors: [`Error cargando el historial de eventos de Supabase: ${error.message}`],
      }
    }

    if (!events || events.length === 0) {
      return {
        valid: true, // Una cadena vacía técnicamente es consistente
        errors: [],
      }
    }

    let previousHash: string | null = null

    for (let i = 0; i < events.length; i++) {
      const event = events[i] as SessionEvent

      // A. Validar coherencia del index secuencial
      if (event.event_index !== i) {
        errors.push(
          `Tampering detectado: Discontinuidad de índice. Evento ${event.id} tiene índice ${event.event_index} pero se esperaba ${i}.`
        )
      }

      // B. Validar coherencia del prevHash
      if (event.previous_hash !== previousHash) {
        errors.push(
          `Tampering detectado: Discontinuidad de la cadena. Evento ${event.id} (índice ${event.event_index}) apunta a prevHash "${event.previous_hash}" pero el hash del evento anterior era "${previousHash}".`
        )
      }

      // C. Re-calcular y verificar el hash actual
      const computedHash = SessionEngine.calculateEventHash(
        event.previous_hash,
        event.session_id,
        event.user_id,
        event.type,
        event.payload,
        event.event_index,
        new Date(event.timestamp).toISOString()
      )

      if (computedHash !== event.hash) {
        errors.push(
          `Tampering detectado: Hash inválido. Evento ${event.id} (índice ${event.event_index}) tiene hash "${event.hash}" guardado, pero el hash re-calculado de los datos es "${computedHash}".`
        )
      }

      // Guardar hash actual para verificar en la siguiente iteración
      previousHash = event.hash
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Reconstruye el estado de un trámite en cualquier punto en el tiempo a partir de sus eventos (Event Replay).
   */
  public replaySessionState(events: SessionEvent[], targetIndex?: number) {
    let state = {
      tramiteId: '',
      currentStep: 'inicial',
      progress: 0,
      status: 'active',
      metadata: {} as any,
      stepsCompleted: 0,
    }

    const eventsToProcess = targetIndex !== undefined
      ? events.filter(e => e.event_index <= targetIndex)
      : events

    for (const event of eventsToProcess) {
      switch (event.type) {
        case 'SESSION_CREATED':
          state.tramiteId = event.payload.tramite_id || ''
          state.currentStep = event.payload.starting_step || 'inicial'
          state.metadata = { ...event.payload.metadata }
          break

        case 'TRAMITE_STARTED':
          state.tramiteId = event.payload.tramite_id
          state.currentStep = event.payload.starting_step
          break

        case 'STEP_ADVANCED':
          state.currentStep = event.payload.currentStep
          state.progress = event.payload.progress
          state.stepsCompleted++
          break

        case 'STEP_REGRESSED':
          state.currentStep = event.payload.currentStep
          state.progress = event.payload.progress
          if (state.stepsCompleted > 0) state.stepsCompleted--
          break

        case 'SESSION_PAUSED':
          state.status = 'paused'
          break

        case 'SESSION_COMPLETED':
          state.status = 'completed'
          state.progress = 100
          break
      }
    }

    return state
  }
}
