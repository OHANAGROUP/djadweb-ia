// tests/v3/causal-engine/scenario-simulator.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ScenarioSimulator } from '@/core/causal-engine/scenarioSimulator'
import sessionFixture from '../fixtures/session-fixture.json'

describe('v3/causal-engine - Scenario Simulator Tests', () => {
  let simulator: ScenarioSimulator

  beforeEach(() => {
    simulator = new ScenarioSimulator()
  })

  it('debería ramificar y simular múltiples futuros candidatos', () => {
    const paths = simulator.simulateScenarios(sessionFixture as any, [], ['__ACTION__NEXT__', '__ACTION__PREV__'])
    expect(paths.length).toBe(2)
    expect(paths[0].nodes[1].currentStep).toBe('declaration')
    expect(paths[1].nodes[1].currentStep).toBe('onboarding')
  })
})
