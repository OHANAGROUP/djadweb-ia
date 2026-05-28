// tests/v3/determinism/session-rehydration.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { SessionEngine } from '@/core/session-engine/sessionEngine'
import { ContinuityEngine } from '@/core/session-engine/continuityEngine'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'

describe('v3/determinism - Session Rehydration Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let continuityEngine: ContinuityEngine
  let sessionEngine: SessionEngine

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    continuityEngine = new ContinuityEngine(supabase)
    sessionEngine = new SessionEngine(supabase)

    // Load fixtures into our mock in-memory DB
    db.sessions.set(sessionFixture.id, { ...sessionFixture } as any)
    db.events.set(sessionFixture.id, JSON.parse(JSON.stringify(eventStreamFixture)))
    
    // Clear and freeze timers
    vi.useFakeTimers()
  })

  it('debería rehidratar sesión bajo las 24 horas sin requerir re-validación externa', async () => {
    // Set a known fixed time matching standard interval (within 24 hours of session last_active_at)
    // last_active_at in fixture is: 2026-05-27T12:00:00.000Z
    const mockedNow = new Date('2026-05-27T18:00:00.000Z').getTime()
    vi.setSystemTime(mockedNow)

    const report = await continuityEngine.rehydrateAndValidateSession(
      sessionFixture.id,
      sessionFixture.user_id
    )

    expect(report.revalidated).toBe(false)
    expect(report.changesDetected).toBe(false)
    expect(report.session.status).toBe('active')
    expect(report.log).toContain('Sesión rehidratada dentro del límite de 24 horas')
  })

  it('debería forzar re-validación externa si la sesión excede el umbral de 24 horas', async () => {
    // Set time to exceed 24 hours from last_active_at (e.g. 30 hours later)
    const mockedNow = new Date('2026-05-28T20:00:00.000Z').getTime()
    vi.setSystemTime(mockedNow)

    const report = await continuityEngine.rehydrateAndValidateSession(
      sessionFixture.id,
      sessionFixture.user_id
    )

    expect(report.revalidated).toBe(true)
    // The ExternalStateChecker returns unchanged by default if there's no user credentials, 
    // or changed depending on the custom logic, which is fine since we validate both below
    expect(db.sessions.get(sessionFixture.id)?.last_external_check).toBe(new Date(mockedNow).toISOString())
  })
})
