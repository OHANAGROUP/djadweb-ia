// tests/v3/guardian/guardian-integrity.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import { SessionEngine } from '@/core/session-engine/sessionEngine'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'

describe('v3/guardian - Integrity Monitor Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)

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

  it('debería reportar OK si el ledger es criptográficamente consistente', async () => {
    const result = await guardian.validateSession(sessionFixture.id, sessionFixture.user_id)
    expect(result.action).toBe('PROCEED')
    expect(result.message).toContain('Todo en orden')
  })

  it('debería reportar FROZEN_ROLLBACK si hay corrupción de hash en el ledger', async () => {
    const events = db.events.get(sessionFixture.id) || []
    
    // Corrumpir el payload del segundo paso para alterar el hash
    if (events.length > 2) {
      events[2].payload = { ...events[2].payload, corruptedField: true }
    }
    
    db.events.set(sessionFixture.id, events)

    const result = await guardian.validateSession(sessionFixture.id, sessionFixture.user_id)
    
    expect(result.action).toBe('FROZEN_ROLLBACK')
    expect(result.message).toContain('Cadena corrupta detectada')
    
    // La sesión debe ser auto-recuperada a activa tras el rollback en Supabase
    expect(db.sessions.get(sessionFixture.id)?.status).toBe('active')
  })
})
