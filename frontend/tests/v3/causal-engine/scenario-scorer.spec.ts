// tests/v3/causal-engine/scenario-scorer.spec.ts
import { describe, it, expect } from 'vitest'
import { ScenarioScorer } from '@/core/causal-engine/scenarioScorer'

describe('v3/causal-engine - Scenario Scorer Tests', () => {
  it('debería puntuar y ordenar escenarios de mayor a menor seguridad', () => {
    const mockSimulations = [
      {
        action: '__ACTION__NEXT__',
        path: {
          nodes: [],
          edges: [{ from: 'a', to: 'b', action: '__ACTION__NEXT__', probability: 1, riskScore: 50 }],
          violations: [{ invariantId: 'R1_ABS_IDEMPOTENCY', domain: 'idempotency' as any, severity: 'critical' as any, violationAction: 'block' as any, description: 'err' }],
          riskScore: 50,
          passed: false
        }
      },
      {
        action: 'PAYMENT_COMPLETED',
        path: {
          nodes: [],
          edges: [{ from: 'a', to: 'b', action: 'PAYMENT_COMPLETED', probability: 1, riskScore: 0 }],
          violations: [],
          riskScore: 0,
          passed: true
        }
      }
    ]

    const ranked = ScenarioScorer.rankScenarios(mockSimulations)
    expect(ranked[0].action).toBe('PAYMENT_COMPLETED')
    expect(ranked[0].status).toBe('ALLOW')
    expect(ranked[1].action).toBe('__ACTION__NEXT__')
    expect(ranked[1].status).toBe('BLOCK')
  })
})
