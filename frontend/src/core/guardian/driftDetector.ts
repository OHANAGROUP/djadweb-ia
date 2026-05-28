// src/core/guardian/driftDetector.ts
/**
 * DriftDetector — Supervisor de Desvíos Temporales, Estructurales y Externos.
 *
 * Analiza incoherencias entre el estado actual en caliente, la reducción de eventos
 * y la información real del contribuyente en portales gubernamentales.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { Session, SessionEvent } from '@/core/session-engine/sessionEngine'

export type DriftType = 'TEMPORAL_DRIFT' | 'STRUCTURAL_DRIFT' | 'EXTERNAL_DRIFT'

export interface DriftReport {
  detected: boolean
  type?: DriftType
  severity: 'LOW' | 'HIGH' | 'CRITICAL'
  details: string
}

export class DriftDetector {
  private supabase: SupabaseClient

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  /**
   * Ejecuta la evaluación de desvíos en caliente sobre la sesión y su historial de eventos.
   */
  public async checkDrift(session: Session, events: SessionEvent[]): Promise<DriftReport> {
    const stepEvs = events.filter(e => e.type === 'STEP_ADVANCED' || e.type === 'TRAMITE_STARTED')
    const lastEv = stepEvs[stepEvs.length - 1]
    const expStep = lastEv ? (lastEv.type === 'STEP_ADVANCED' ? lastEv.payload.currentStep : lastEv.payload.starting_step) : 'none'
    const lastActive = new Date(session.last_active_at).getTime()
    const now = Date.now()
    const elapsed = now - lastActive

    // 1. Detectar TEMPORAL_DRIFT (Inactividad crítica > 72 horas)
    if (elapsed > 72 * 60 * 60 * 1000) {
      return {
        detected: true,
        type: 'TEMPORAL_DRIFT',
        severity: 'HIGH',
        details: `Sesión inactiva por más de 72 horas (${Math.round(
          elapsed / (60 * 60 * 1000)
        )} horas acumuladas).`,
      }
    }

    // 2. Detectar STRUCTURAL_DRIFT (Desviación entre puntero en caliente y Ledger)
    if (events.length > 0) {
      const stepEvents = events.filter(e => e.type === 'STEP_ADVANCED' || e.type === 'TRAMITE_STARTED')
      if (stepEvents.length > 0) {
        const lastEvent = stepEvents[stepEvents.length - 1]
        const expectedStep =
          lastEvent.type === 'STEP_ADVANCED'
            ? lastEvent.payload.currentStep
            : lastEvent.payload.starting_step

        if (session.current_step !== expectedStep) {
          return {
            detected: true,
            type: 'STRUCTURAL_DRIFT',
            severity: 'CRITICAL',
            details: `Puntero de paso corrupto: sesión apunta a "${session.current_step}" pero el Ledger recalculado indica "${expectedStep}".`,
          }
        }
      }
    }

    // 3. Detectar EXTERNAL_DRIFT (Discrepancia tributaria forzada)
    if (session.session_metadata?.requiresStepRegression === true) {
      return {
        detected: true,
        type: 'EXTERNAL_DRIFT',
        severity: 'CRITICAL',
        details: 'Desviación del SII/TGR detectada en el estado externo del contribuyente.',
      }
    }

    return {
      detected: false,
      severity: 'LOW',
      details: 'Sin desvíos operacionales detectados (OK).',
    }
  }
}
