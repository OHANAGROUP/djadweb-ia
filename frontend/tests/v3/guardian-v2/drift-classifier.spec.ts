// tests/v3/guardian-v2/drift-classifier.spec.ts
import { describe, it, expect } from 'vitest'
import { DriftClassifier } from '@/core/guardian/driftClassifier'

describe('v3/guardian-v2 - Drift Classifier Tests', () => {
  const classifier = new DriftClassifier()

  it('debería clasificar TEMPORAL_DRIFT correctamente con severidad y acción sugerida', () => {
    const reportLow = classifier.classifyTemporalDrift('session-123', 12)
    expect(reportLow.type).toBe('TEMPORAL_DRIFT')
    expect(reportLow.severity).toBe('medium')
    expect(reportLow.suggested_action).toBe('continue-safe')

    const reportCritical = classifier.classifyTemporalDrift('session-123', 80)
    expect(reportCritical.type).toBe('TEMPORAL_DRIFT')
    expect(reportCritical.severity).toBe('critical')
    expect(reportCritical.suggested_action).toBe('freeze')
  })

  it('debería clasificar STATE_DRIFT con severidad crítica y sugerir rollback', () => {
    const report = classifier.classifyStateDrift('session-123', 'desalineación de pasos')
    expect(report.type).toBe('STATE_DRIFT')
    expect(report.severity).toBe('critical')
    expect(report.suggested_action).toBe('rollback')
    expect(report.details).toContain('desalineación')
  })

  it('debería clasificar EXTERNAL_DRIFT con severidad crítica y sugerir freeze', () => {
    const report = classifier.classifyExternalDrift('session-123', 'discrepancia del SII')
    expect(report.type).toBe('EXTERNAL_DRIFT')
    expect(report.severity).toBe('critical')
    expect(report.suggested_action).toBe('freeze')
  })

  it('debería clasificar REPLAY_NON_DETERMINISM con severidad crítica y sugerir rollback', () => {
    const report = classifier.classifyReplayNonDeterminism('session-123', 'cambio de hash chain')
    expect(report.type).toBe('REPLAY_NON_DETERMINISM')
    expect(report.severity).toBe('critical')
    expect(report.suggested_action).toBe('rollback')
  })
})
