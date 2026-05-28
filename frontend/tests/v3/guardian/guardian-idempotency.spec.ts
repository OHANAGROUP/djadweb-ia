// tests/v3/guardian/guardian-idempotency.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import { IdempotencyFirewall } from '@/core/guardian/idempotencyFirewall'
import { SessionEngine } from '@/core/session-engine/sessionEngine'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'

describe('v3/guardian - Idempotency Firewall Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian
  let firewall: IdempotencyFirewall

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)
    firewall = new IdempotencyFirewall(supabase)

    db.sessions.set(sessionFixture.id, {
      ...sessionFixture,
      current_step: 'declaration',
      progress: 25
    } as any)

    // Generate valid linked event stream
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

  it('debería permitir la primera ejecución de un evento crítico (UNSAFE)', async () => {
    const transactionId = 'tx-pago-998877'
    const result = await guardian.onEvent(
      sessionFixture.id,
      sessionFixture.user_id,
      'PAYMENT_COMPLETED',
      { transactionId, amount: 150000 }
    )

    expect(result.action).toBe('PROCEED')
    
    // Debería estar registrado en el log de ejecuciones de Supabase
    const isExec = await firewall.isExecuted(transactionId)
    expect(isExec).toBe(true)
  })

  it('debería bloquear e interceptar el segundo intento de ejecución de un evento crítico duplicado', async () => {
    const transactionId = 'tx-pago-duplicado'

    // 1. Primer intento (debe pasar)
    const result1 = await guardian.onEvent(
      sessionFixture.id,
      sessionFixture.user_id,
      'PAYMENT_COMPLETED',
      { transactionId, amount: 150000 }
    )
    expect(result1.action).toBe('PROCEED')

    // 2. Segundo intento (debe ser bloqueado por el firewall de idempotencia)
    const result2 = await guardian.onEvent(
      sessionFixture.id,
      sessionFixture.user_id,
      'PAYMENT_COMPLETED',
      { transactionId, amount: 150000 }
    )
    
    expect(result2.action).toBe('BLOCKED')
    expect(result2.message).toContain('Ejecución redundante bloqueada')
  })
})
