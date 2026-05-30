// tests/v3/guardian-v2/watchdog-loop.spec.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'
import { SessionEngine } from '@/core/session-engine/sessionEngine'

describe('v3/guardian-v2 - Watchdog Loop Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)

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

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-27T18:00:00.000Z').getTime())
  })

  afterEach(() => {
    guardian.stopWatchdog(sessionFixture.id)
    vi.useRealTimers()
  })

  it('debería ejecutar el loop del watchdog periódicamente y detenerse al detectar un desvío crítico', async () => {
    // Activar watchdog loop a 2000ms
    guardian.initWatchdog(sessionFixture.id, sessionFixture.user_id, 2000)

    // Inducir desvío estructural (modificar paso de sesión principal)
    const session = db.sessions.get(sessionFixture.id)
    if (session) {
      session.current_step = 'malicious_injected_step'
      db.sessions.set(sessionFixture.id, session)
    }

    // Avanzar reloj simulado en 2000ms para disparar el watchdog
    await vi.advanceTimersByTimeAsync(2000)

    // El watchdog debería haber detectado el desvío y congelado la sesión
    const updatedSession = db.sessions.get(sessionFixture.id)
    expect(updatedSession?.status).toBe('paused')
  })
})
