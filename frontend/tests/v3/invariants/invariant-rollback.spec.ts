// tests/v3/invariants/invariant-rollback.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import sessionFixture from '../fixtures/session-fixture.json'

describe('v3/invariants - Rollback Safety Tests (R4)', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)

    db.sessions.set(sessionFixture.id, { ...sessionFixture } as any)
    db.events.set(sessionFixture.id, [])
  })

  it('debería confirmar que los rollbacks no alteran o destruyen el ledger contiguo', async () => {
    const proposedAction = { type: 'STEP_REGRESSED', payload: { currentStep: 'onboarding' } }
    const result = await guardian.evaluateInvariants(sessionFixture.id, sessionFixture.user_id, proposedAction, 'dry-run')

    expect(result.passed).toBe(true) 
  })
})
