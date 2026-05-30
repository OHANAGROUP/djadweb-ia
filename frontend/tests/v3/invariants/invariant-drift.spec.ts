// tests/v3/invariants/invariant-drift.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import sessionFixture from '../fixtures/session-fixture.json'

describe('v3/invariants - Terminal Drift Tests (R2)', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)

    // Configurar sesión con discrepancia externa y de estado
    db.sessions.set(sessionFixture.id, { 
      ...sessionFixture, 
      current_step: 'mismatched_step', 
      session_metadata: { requiresStepRegression: true } 
    } as any)

    db.events.set(sessionFixture.id, [
      {
        id: 'evt-1',
        session_id: sessionFixture.id,
        user_id: sessionFixture.user_id,
        type: 'STEP_ADVANCED',
        payload: { currentStep: 'declaration', progress: 25 },
        event_index: 0,
        hash: 'abc',
        timestamp: new Date().toISOString()
      }
    ])
  })

  it('debería suspender el flujo si se juntan simultáneamente STATE_DRIFT y EXTERNAL_DRIFT', async () => {
    const proposedAction = { type: 'STEP_ADVANCED', payload: { currentStep: 'declaration' } }
    const result = await guardian.evaluateInvariants(sessionFixture.id, sessionFixture.user_id, proposedAction, 'dry-run')

    expect(result.passed).toBe(false)
    expect(result.violations.some(v => v.invariantId === 'R2_TERMINAL_DRIFT')).toBe(true)
  })
})
