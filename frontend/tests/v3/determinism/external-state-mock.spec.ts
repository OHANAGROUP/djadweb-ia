// tests/v3/determinism/external-state-mock.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { ExternalStateChecker } from '@/core/session-engine/externalStateChecker'
import { ContinuityEngine } from '@/core/session-engine/continuityEngine'
import sessionFixture from '../fixtures/session-fixture.json'
import eventStreamFixture from '../fixtures/event-stream-fixture.json'

describe('v3/determinism - External State Mocking Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let stateChecker: ExternalStateChecker
  let continuityEngine: ContinuityEngine

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    stateChecker = new ExternalStateChecker(supabase)
    continuityEngine = new ContinuityEngine(supabase)

    db.sessions.set(sessionFixture.id, { ...sessionFixture } as any)
    db.events.set(sessionFixture.id, JSON.parse(JSON.stringify(eventStreamFixture)))
    
    vi.useFakeTimers()
  })

  it('debería responder amigablemente si el usuario no tiene credenciales del SII conectadas', async () => {
    const result = await stateChecker.verifyExternalState(
      'sii_declaracion_f29',
      sessionFixture.user_id,
      sessionFixture.session_metadata
    )

    expect(result.changed).toBe(false)
    expect(result.revalidationLog).toContain('No hay credenciales del SII configuradas')
    expect(result.details.hasCredentials).toBe(false)
  })

  it('debería detectar discrepancias externas del SII si hay credenciales y varía el estado', async () => {
    // 1. Simular la existencia de credenciales del usuario
    db.credentials.set(sessionFixture.user_id, [{ id: 'cred-123', key_type: 'sii' }])
    
    // Sobrescribir el comportamiento del de base de datos para simular credenciales retornadas
    supabase.from = (table: string) => {
      const originalFrom = createMockSupabaseClient(db).from(table)
      if (table === 'user_credentials') {
        return {
          select: (cols: string) => ({
            eq: (col: string, val: any) => ({
              then(resolve: any) {
                resolve({ data: [{ id: 'cred-123', key_type: 'sii' }], error: null })
              }
            })
          })
        }
      }
      return originalFrom
    }

    const result = await stateChecker.verifyExternalState(
      'sii_declaracion_f29',
      sessionFixture.user_id,
      { declaredAmount: 150000 } // Metadata simulada del paso local
    )

    // El mock en externalStateChecker.ts retorna changed = true cuando currentTaxDebt (0) es menor que declaredAmount (>0)
    expect(result.changed).toBe(true)
    expect(result.revalidationLog).toContain('Discrepancia detectada')
    expect(result.details.currentDebt).toBe(0)
  })
})
