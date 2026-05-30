// tests/v3/causal-engine/causal-graph-builder.spec.ts
import { describe, it, expect } from 'vitest'
import { CausalGraphBuilder } from '@/core/causal-engine/causalGraphBuilder'
import sessionFixture from '../fixtures/session-fixture.json'

describe('v3/causal-engine - Causal Graph Builder Tests', () => {
  it('debería instanciar nodos raíz y predichos correctamente con hashes e invariantes', () => {
    const rootNode = CausalGraphBuilder.createRootNode(sessionFixture as any, [])
    expect(rootNode.id).toContain('node-root')
    expect(rootNode.currentStep).toBe(sessionFixture.current_step)

    const derived = CausalGraphBuilder.deriveNode(rootNode, '__ACTION__NEXT__', { currentStep: 'declaration', progress: 25 }, [])
    expect(derived.node.id).toContain('node-derived')
    expect(derived.node.currentStep).toBe('declaration')
    expect(derived.edge.action).toBe('__ACTION__NEXT__')
  })
})
