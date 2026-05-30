// tests/v3/invariants/invariant-idempotency.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import sessionFixture from '../fixtures/session-fixture.json'

describe('v3/invariants - Absolute Idempotency Tests (R1)', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)

    db.sessions.set(sessionFixture.id, { ...sessionFixture } as any)
    db.events.set(sessionFixture.id, [
      {
        id: 'evt-payment-existente',
        session_id: sessionFixture.id,
        user_id: sessionFixture.user_id,
        type: 'PAYMENT_COMPLETED',
        payload: { amount: 150000, transactionId: 'tx-mp-999888' },
        event_index: 0,
        hash: 'abc',
        timestamp: new Date().toISOString()
      }
    ])
  })

  it('debería bloquear un intento duplicado de pago (evento UNSAFE)', async () => {
    const proposedAction = { 
      type: 'PAYMENT_COMPLETED', 
      payload: { amount: 150000, transactionId: 'tx-mp-999888' } 
    }
    const result = await guardian.evaluateInvariants(sessionFixture.id, sessionFixture.user_id, proposedAction, 'dry-run')

    expect(result.passed).toBe(false)
    expect(result.violations.some(v => v.invariantId === 'R1_ABS_IDEMPOTENCY')).toBe(true)
  })
})
