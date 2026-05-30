// tests/v3/guardian-v2/rollback-intelligence.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RollbackEngine } from '@/core/guardian/rollbackEngine'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'
import { SessionEngine } from '@/core/session-engine/sessionEngine'

describe('v3/guardian-v2 - Rollback Intelligence v2 Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let rollbackEngine: RollbackEngine

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    rollbackEngine = new RollbackEngine(supabase)

    db.sessions.set(sessionFixture.id, { ...sessionFixture } as any)

    const events = JSON.parse(JSON.stringify(eventStreamFixture))
    let prevHash: string | null = null
    const verifiedEvents = events.map((e: any, index: number) => {
      e.event_index = index
      e.previous_hash = prevHash
      e.hash = SessionEngine.calculateEventHash(
        prevHash,
        e.session_id,
        e.user_id,
        e.type,
        e.payload,
        e.event_index,
        new Date(e.timestamp).toISOString()
      )
      prevHash = e.hash
      return e
    })
    db.events.set(sessionFixture.id, verifiedEvents)
  })

  it('debería aplicar rollbackByDrift correctamente y alertar si hay eventos no-idempotentes (UNSAFE)', async () => {
    // Inyectar un evento crítico (no-idempotente) después del índice seguro
    const events = db.events.get(sessionFixture.id) || []
    events.push({
      id: 'evt-payment-unsafe',
      session_id: sessionFixture.id,
      user_id: sessionFixture.user_id,
      type: 'PAYMENT_COMPLETED',
      payload: { amount: 15000, transactionId: 'tx-pay-999' },
      event_index: events.length,
      previous_hash: events[events.length - 1]?.hash || null,
      hash: 'fake-hash-for-payment',
      timestamp: new Date().toISOString()
    })
    db.events.set(sessionFixture.id, events)

    const spyWarn = vi.spyOn(console, 'warn')

    const lastSafeIndex = 1 // Rollback al evento de onboarding/inicio (TRAMITE_STARTED)
    const updatedSession = await rollbackEngine.rollbackByDrift(
      sessionFixture.id,
      sessionFixture.user_id,
      'STATE_DRIFT',
      lastSafeIndex
    )

    expect(updatedSession.current_step).toBe('onboarding')
    expect(updatedSession.status).toBe('active')
    
    // Debería emitir advertencia de seguridad para evitar side-effects
    expect(spyWarn).toHaveBeenCalledWith(
      expect.stringContaining('Se detectaron eventos de efectos secundarios (UNSAFE) en el rango de rollback')
    )
    
    spyWarn.mockRestore()
  })
})
