// tests/v3/determinism/continuity-expiration.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { ContinuityEngine } from '@/core/session-engine/continuityEngine'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'

describe('v3/determinism - Continuity Expiration Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let continuityEngine: ContinuityEngine

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    continuityEngine = new ContinuityEngine(supabase)

    db.sessions.set(sessionFixture.id, { ...sessionFixture } as any)
    db.events.set(sessionFixture.id, JSON.parse(JSON.stringify(eventStreamFixture)))
    
    vi.useFakeTimers()
  })

  it('debería marcar require_revalidation y disparar ExternalStateChecker al expirar las 24 horas', async () => {
    // 1. Simular tiempo congelado posterior a 25 horas del last_active_at (last_active_at en fixture es 2026-05-27T12:00:00.000Z)
    const mockedNow = new Date('2026-05-28T14:00:00.000Z').getTime()
    vi.setSystemTime(mockedNow)

    // 2. Intentar rehidratar la sesión
    const report = await continuityEngine.rehydrateAndValidateSession(
      sessionFixture.id,
      sessionFixture.user_id
    )

    // 3. Verificar que se disparó la re-verificación
    expect(report.revalidated).toBe(true)
    
    // 4. Comprobar que en la base de datos se actualizó el check time y se apagó el flag temporal
    const s = db.sessions.get(sessionFixture.id)
    expect(s?.last_external_check).toBe(new Date(mockedNow).toISOString())
    expect(s?.requires_revalidation).toBe(false)
  })
})
