// tests/v3/guardian-v2/ci-guardian-gate.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import { AuditEngine } from '@/core/audit-engine/auditEngine'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'
import { SessionEngine } from '@/core/session-engine/sessionEngine'

describe('v3/guardian-v2 - CI Guardian Gate Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian
  let auditEngine: AuditEngine

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)
    auditEngine = new AuditEngine(supabase)

    const session = { 
      ...sessionFixture, 
      current_step: 'declaration',
      last_active_at: new Date().toISOString(),
      requires_revalidation: false 
    }
    db.sessions.set(sessionFixture.id, session as any)

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

  it('debería pasar limpiamente el CI Gate si el Ledger está 100% íntegro y sin drifts', async () => {
    const result = await auditEngine.verifySessionIntegrity(sessionFixture.id)
    expect(result.valid).toBe(true)
    expect(result.errors.length).toBe(0)

    const guardianResult = await guardian.validateSession(sessionFixture.id, sessionFixture.user_id)
    expect(guardianResult.action).toBe('PROCEED')
  })

  it('debería RECHAZAR el CI Gate si se altera maliciosamente un evento del Ledger (Tampering / Drift)', async () => {
    // Introducir alteración maliciosa en los datos de un evento
    const events = db.events.get(sessionFixture.id) || []
    if (events.length > 1) {
      events[1].payload = { ...events[1].payload, altered: true }
      db.events.set(sessionFixture.id, events)
    }

    const result = await auditEngine.verifySessionIntegrity(sessionFixture.id)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)

    const guardianResult = await guardian.validateSession(sessionFixture.id, sessionFixture.user_id)
    expect(guardianResult.action).toBe('FROZEN_ROLLBACK')
  })
})
