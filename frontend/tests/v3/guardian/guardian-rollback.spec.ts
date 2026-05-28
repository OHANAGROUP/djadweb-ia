// tests/v3/guardian/guardian-rollback.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import { RollbackEngine } from '@/core/guardian/rollbackEngine'
import { SessionEngine } from '@/core/session-engine/sessionEngine'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'

describe('v3/guardian - Rollback Engine Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian
  let rollbackEngine: RollbackEngine

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)
    rollbackEngine = new RollbackEngine(supabase)

    db.sessions.set(sessionFixture.id, { ...sessionFixture } as any)
    
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

  it('debería ejecutar rollback seguro reposicionando punteros operacionales sin eliminar eventos del ledger', async () => {
    const originalEventsLength = db.events.get(sessionFixture.id)?.length || 0
    
    // Ejecutar rollback al paso seguro del evento de índice 2 ('STEP_ADVANCED' -> 'declaration', progress 25)
    const freshSession = await rollbackEngine.rollbackToLastSafe(
      sessionFixture.id,
      sessionFixture.user_id,
      2
    )

    expect(freshSession.current_step).toBe('declaration')
    expect(freshSession.progress).toBe(25)
    expect(freshSession.status).toBe('active')

    // Verificar supremacía inmutable del Ledger: no se borraron eventos, se agregó uno de regresión
    const updatedEvents = db.events.get(sessionFixture.id) || []
    expect(updatedEvents.length).toBe(originalEventsLength + 1)
    expect(updatedEvents[updatedEvents.length - 1].type).toBe('STEP_REGRESSED')
  })
})
