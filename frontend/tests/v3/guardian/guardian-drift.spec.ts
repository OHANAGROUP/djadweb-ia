// tests/v3/guardian/guardian-drift.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import { SessionEngine } from '@/core/session-engine/sessionEngine'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'

describe('v3/guardian - Drift Detector Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)

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
    
    vi.useFakeTimers()
    const initialTime = new Date('2026-05-27T18:00:00.000Z').getTime()
    vi.setSystemTime(initialTime)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debería detectar TEMPORAL_DRIFT y suspender la sesión si la inactividad excede las 72 horas', async () => {
    // last_active_at in fixture is: 2026-05-27T12:00:00.000Z
    // Simulate time at +80 hours later
    const mockedNow = new Date('2026-05-30T20:00:00.000Z').getTime()
    vi.setSystemTime(mockedNow)

    const result = await guardian.validateSession(sessionFixture.id, sessionFixture.user_id)
    
    // Under v2, a critical temporal drift (>72h) triggers a FROZEN_DRIFT to ensure system-wide safety.
    expect(result.action).toBe('FROZEN_DRIFT')
  })

  it('debería detectar STRUCTURAL_DRIFT y congelar la sesión ante discrepancias de punteros', async () => {
    // Modify mother session step to a mismatched value
    const session = db.sessions.get(sessionFixture.id)
    if (session) {
      session.current_step = 'malicious_injected_step'
      db.sessions.set(sessionFixture.id, session)
    }

    const result = await guardian.validateSession(sessionFixture.id, sessionFixture.user_id)
    
    expect(result.action).toBe('FROZEN_DRIFT')
    expect(result.message).toContain('Puntero de paso corrupto')
    expect(db.sessions.get(sessionFixture.id)?.status).toBe('paused')
  })

  it('debería detectar EXTERNAL_DRIFT y congelar si hay discrepancias del SII indicadas en metadata', async () => {
    const session = db.sessions.get(sessionFixture.id)
    if (session) {
      session.current_step = 'declaration'
      session.progress = 25
      session.session_metadata = {
        ...session.session_metadata,
        requiresStepRegression: true // Forzado por discrepancia del SII en continuidad
      }
      db.sessions.set(sessionFixture.id, session)
    }

    const result = await guardian.validateSession(sessionFixture.id, sessionFixture.user_id)
    
    expect(result.action).toBe('FROZEN_DRIFT')
    expect(result.message).toContain('Desviación del SII/TGR detectada')
  })
})
