// tests/v3/determinism/event-replay.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { SessionEngine } from '@/core/session-engine/sessionEngine'
import { AuditEngine } from '@/core/audit-engine/auditEngine'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'

describe('v3/determinism - Event Replay & Integrity Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let auditEngine: AuditEngine
  let sessionEngine: SessionEngine

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    auditEngine = new AuditEngine(supabase)
    sessionEngine = new SessionEngine(supabase)

    db.sessions.set(sessionFixture.id, { ...sessionFixture } as any)
    db.events.set(sessionFixture.id, JSON.parse(JSON.stringify(eventStreamFixture)))
  })

  it('debería pasar la auditoría criptográfica si el ledger no ha sido alterado', async () => {
    // Generate events sequentially with correct hashes to make sure they pass the audit
    const events = db.events.get(sessionFixture.id) || []
    
    // We should compute actual hashes in sequence to guarantee the chain is perfect
    let prevHash: string | null = null
    const verifiedEvents = events.map((e, index) => {
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

    const integrity = await auditEngine.verifySessionIntegrity(sessionFixture.id)
    expect(integrity.valid).toBe(true)
    expect(integrity.errors).toHaveLength(0)
  })

  it('debería alertar y fallar si hay discontinuidad de índices en el Ledger', async () => {
    const events = db.events.get(sessionFixture.id) || []
    
    // Break index sequence
    if (events.length > 2) {
      events[2].event_index = 99
    }
    
    db.events.set(sessionFixture.id, events)

    const integrity = await auditEngine.verifySessionIntegrity(sessionFixture.id)
    expect(integrity.valid).toBe(false)
    expect(integrity.errors.some(e => e.includes('Tampering detectado: Discontinuidad de índice'))).toBe(true)
  })

  it('debería alertar y fallar si un hash criptográfico de datos ha sido alterado', async () => {
    const events = db.events.get(sessionFixture.id) || []
    
    // Alter payload of an event
    if (events.length > 2) {
      events[2].payload = { ...events[2].payload, maliciousAmount: 999999 }
    }
    
    db.events.set(sessionFixture.id, events)

    const integrity = await auditEngine.verifySessionIntegrity(sessionFixture.id)
    expect(integrity.valid).toBe(false)
    expect(integrity.errors.some(e => e.includes('Tampering detectado: Hash inválido'))).toBe(true)
  })

  it('debería reconstruir con éxito el estado exacto del trámite mediante Event Replay', async () => {
    const events = db.events.get(sessionFixture.id) || []
    const state = auditEngine.replaySessionState(events)

    expect(state.tramiteId).toBe('sii_declaracion_f29')
    expect(state.currentStep).toBe('declaration')
    expect(state.progress).toBe(25)
  })
})
