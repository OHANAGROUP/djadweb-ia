// tests/v3/invariants/invariant-continuity.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import sessionFixture from '../fixtures/session-fixture.json'

describe('v3/invariants - Continuity Override Tests (R3)', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)

    db.sessions.set(sessionFixture.id, { 
      ...sessionFixture, 
      requires_revalidation: true 
    } as any)
    db.events.set(sessionFixture.id, [])
  })

  it('debería bloquear transiciones si la sesión requiere revalidación', async () => {
    const proposedAction = { type: 'STEP_ADVANCED', payload: { currentStep: 'declaration' } }
    const result = await guardian.evaluateInvariants(sessionFixture.id, sessionFixture.user_id, proposedAction, 'dry-run')

    expect(result.passed).toBe(false)
    expect(result.violations.some(v => v.invariantId === 'R3_CONTINUITY_OVERRIDE')).toBe(true)
  })
})
