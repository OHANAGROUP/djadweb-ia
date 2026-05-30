// src/core/guardian/driftDetector.ts
/**
 * DriftDetector — Supervisor de Desvíos Temporales, Estructurales y Externos.
 *
 * Analiza incoherencias entre el estado actual en caliente, la reducción de eventos
 * y la información real del contribuyente en portales gubernamentales.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { Session, SessionEvent } from '@/core/session-engine/sessionEngine'
import { DriftClassifier, DriftClassification } from './driftClassifier'

export type DriftType = 'TEMPORAL_DRIFT' | 'STRUCTURAL_DRIFT' | 'STATE_DRIFT' | 'EXTERNAL_DRIFT' | 'REPLAY_NON_DETERMINISM'

export interface DriftReport {
  detected: boolean
  type?: DriftType
  severity: 'LOW' | 'HIGH' | 'CRITICAL'
  details: string
  classification?: DriftClassification
}

export class DriftDetector {
  private supabase: SupabaseClient
  private classifier: DriftClassifier

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
    this.classifier = new DriftClassifier()
  }

  /**
   * Ejecuta la evaluación de desvíos en caliente sobre la sesión y su historial de eventos.
   */
  public async checkDrift(session: Session, events: SessionEvent[]): Promise<DriftReport> {
    const stepEvs = events.filter(e => e.type === 'STEP_ADVANCED' || e.type === 'TRAMITE_STARTED')
    const lastEv = stepEvs[stepEvs.length - 1]
    const lastActive = new Date(session.last_active_at).getTime()
    const now = Date.now()
    const elapsed = now - lastActive

    // 1. Detectar TEMPORAL_DRIFT (Inactividad crítica > 72 horas)
    if (elapsed > 72 * 60 * 60 * 1000) {
      const elapsedHours = elapsed / (60 * 60 * 1000)
      const classification = this.classifier.classifyTemporalDrift(session.id, elapsedHours)
      return {
        detected: true,
        type: 'TEMPORAL_DRIFT',
        severity: 'HIGH',
        details: classification.details,
        classification,
      }
    }

    // 2. Detectar STATE_DRIFT / STRUCTURAL_DRIFT (Desviación entre puntero en caliente y Ledger)
    if (events.length > 0) {
      const stepEvents = events.filter(e => e.type === 'STEP_ADVANCED' || e.type === 'TRAMITE_STARTED')
      if (stepEvents.length > 0) {
        const lastEvent = stepEvents[stepEvents.length - 1]
        const expectedStep =
          lastEvent.type === 'STEP_ADVANCED'
            ? lastEvent.payload.currentStep
            : lastEvent.payload.starting_step

        if (session.current_step !== expectedStep) {
          const details = `Puntero de paso corrupto: sesión apunta a "${session.current_step}" pero el Ledger recalculado indica "${expectedStep}".`
          const classification = this.classifier.classifyStateDrift(session.id, details)
          return {
            detected: true,
            type: 'STRUCTURAL_DRIFT',
            severity: 'CRITICAL',
            details,
            classification,
          }
        }
      }
    }

    // 3. Detectar EXTERNAL_DRIFT (Discrepancia tributaria forzada)
    if (session.session_metadata?.requiresStepRegression === true) {
      const details = 'Desviación del SII/TGR detectada en el estado externo del contribuyente.'
      const classification = this.classifier.classifyExternalDrift(session.id, details)
      return {
        detected: true,
        type: 'EXTERNAL_DRIFT',
        severity: 'CRITICAL',
        details,
        classification,
      }
    }

    // 4. Detectar REPLAY_NON_DETERMINISM (Fallo de replay o cambio de hash)
    if (session.session_metadata?.replayFailed === true) {
      const details = 'No determinismo detectado durante la re-ejecución del flujo.'
      const classification = this.classifier.classifyReplayNonDeterminism(session.id, details)
      return {
        detected: true,
        type: 'REPLAY_NON_DETERMINISM',
        severity: 'CRITICAL',
        details,
        classification,
      }
    }

    return {
      detected: false,
      severity: 'LOW',
      details: 'Sin desvíos operacionales detectados (OK).',
    }
  }
}
