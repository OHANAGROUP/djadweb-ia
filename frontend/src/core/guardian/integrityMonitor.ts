// src/core/guardian/integrityMonitor.ts
/**
 * IntegrityMonitor — Validador de Integridad Criptográfica y Replay en Tiempo Real.
 *
 * Monitorea que la secuencia del Ledger sea 100% contigua, ordenada y libre de alteraciones.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { SessionEngine, SessionEvent } from '@/core/session-engine/sessionEngine'

export interface IntegrityReport {
  status: 'OK' | 'DRIFT' | 'CORRUPTED'
  lastValidIndex: number
  expectedHash: string
  actualHash: string
  errors: string[]
}

export class IntegrityMonitor {
  private supabase: SupabaseClient

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  /**
   * Valida la coherencia de índice, cadena de hash y replay de la sesión.
   */
  public async validateSession(sessionId: string): Promise<IntegrityReport> {
    const { data: events, error } = await this.supabase
      .from('tramite_session_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('event_index', { ascending: true })

    if (error) {
      return {
        status: 'CORRUPTED',
        lastValidIndex: -1,
        expectedHash: '',
        actualHash: '',
        errors: [`Error cargando el Ledger de base de datos: ${error.message}`],
      }
    }

    if (!events || events.length === 0) {
      return {
        status: 'OK',
        lastValidIndex: -1,
        expectedHash: '',
        actualHash: '',
        errors: [],
      }
    }

    let previousHash: string | null = null
    let lastValidIndex = -1
    const errors: string[] = []

    for (let i = 0; i < events.length; i++) {
      const event = events[i] as SessionEvent

      // 1. Validar coherencia del index secuencial
      if (event.event_index !== i) {
        errors.push(
          `Discontinuidad de índice en evento ${event.id}: se esperaba ${i} pero se obtuvo ${event.event_index}.`
        )
        return {
          status: 'CORRUPTED',
          lastValidIndex,
          expectedHash: previousHash || '',
          actualHash: event.previous_hash || '',
          errors,
        }
      }

      // 2. Validar coherencia del prevHash
      if (event.previous_hash !== previousHash) {
        errors.push(
          `Discontinuidad de la firma en evento ${event.id}: apunta a prevHash "${event.previous_hash}" pero el anterior fue "${previousHash}".`
        )
        return {
          status: 'CORRUPTED',
          lastValidIndex,
          expectedHash: previousHash || '',
          actualHash: event.previous_hash || '',
          errors,
        }
      }

      // 3. Re-calcular y verificar el hash actual
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
          `Tampering de datos detectado en evento ${event.id}: hash re-calculado "${computedHash}" difiere del guardado "${event.hash}".`
        )
        return {
          status: 'CORRUPTED',
          lastValidIndex,
          expectedHash: computedHash,
          actualHash: event.hash,
          errors,
        }
      }

      previousHash = event.hash
      lastValidIndex = i
    }

    return {
      status: 'OK',
      lastValidIndex,
      expectedHash: previousHash || '',
      actualHash: previousHash || '',
      errors: [],
    }
  }
}
