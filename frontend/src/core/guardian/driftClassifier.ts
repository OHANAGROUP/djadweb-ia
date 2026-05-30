// src/core/guardian/driftClassifier.ts
/**
 * DriftClassifier — Clasificador de desvíos para Runtime Guardian Mode v2.
 *
 * Clasifica desvíos estructurales, externos, temporales y fallas de no-determinismo.
 * Devuelve un objeto detallado con severidad, fuente, sesión afectada y sugerencia operacional.
 */

export type DriftSeverity = 'low' | 'medium' | 'critical'
export type SuggestedAction = 'freeze' | 'rollback' | 'continue-safe'

export interface DriftClassification {
  type: 'TEMPORAL_DRIFT' | 'STATE_DRIFT' | 'EXTERNAL_DRIFT' | 'REPLAY_NON_DETERMINISM'
  severity: DriftSeverity
  source: string
  affected_session: string
  suggested_action: SuggestedAction
  details: string
}

export class DriftClassifier {
  /**
   * Clasifica un desvío temporal por inactividad.
   */
  public classifyTemporalDrift(sessionId: string, elapsedHours: number): DriftClassification {
    const severity: DriftSeverity = elapsedHours > 72 ? 'critical' : 'medium'
    const suggested_action: SuggestedAction = elapsedHours > 72 ? 'freeze' : 'continue-safe'

    return {
      type: 'TEMPORAL_DRIFT',
      severity,
      source: 'WatchdogTimeMonitor',
      affected_session: sessionId,
      suggested_action,
      details: `Sesión inactiva por más de ${Math.round(elapsedHours)} horas.`,
    }
  }

  /**
   * Clasifica un desvío de estado (desajuste entre puntero en caliente y ledger).
   */
  public classifyStateDrift(sessionId: string, details: string): DriftClassification {
    return {
      type: 'STATE_DRIFT',
      severity: 'critical',
      source: 'LedgerReducibilityValidator',
      affected_session: sessionId,
      suggested_action: 'rollback',
      details,
    }
  }

  /**
   * Clasifica un desvío externo (discrepancias SII/TGR/PJUD).
   */
  public classifyExternalDrift(sessionId: string, details: string): DriftClassification {
    return {
      type: 'EXTERNAL_DRIFT',
      severity: 'critical',
      source: 'ExternalPortalRevalidator',
      affected_session: sessionId,
      suggested_action: 'freeze',
      details,
    }
  }

  /**
   * Clasifica un fallo de no-determinismo (replay diferente).
   */
  public classifyReplayNonDeterminism(sessionId: string, details: string): DriftClassification {
    return {
      type: 'REPLAY_NON_DETERMINISM',
      severity: 'critical',
      source: 'DeterministicReplayOrchestrator',
      affected_session: sessionId,
      suggested_action: 'rollback',
      details,
    }
  }
}
