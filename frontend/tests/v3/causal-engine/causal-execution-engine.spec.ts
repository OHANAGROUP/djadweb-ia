// tests/v3/causal-engine/causal-execution-engine.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { CausalExecutionEngine } from '@/core/causal-engine/causalExecutionEngine'
import sessionFixture from '../fixtures/session-fixture.json'

describe('v3/causal-engine - Causal Execution Engine Tests', () => {
  let engine: CausalExecutionEngine

  beforeEach(() => {
    engine = new CausalExecutionEngine()
  })

  it('debería ejecutar la simulación causal del multiverso y retornar el camino más seguro', () => {
    const result = engine.simulate(sessionFixture as any, [], '__ACTION__NEXT__')

    expect(result.passed).toBe(true)
    expect(result.safestPath).toBeDefined()
    expect(result.fullGraph.nodes.length).toBeGreaterThan(0)
    expect(result.fullGraph.edges.length).toBeGreaterThan(0)
  })
})
