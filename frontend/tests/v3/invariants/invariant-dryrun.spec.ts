// tests/v3/invariants/invariant-dryrun.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { RuntimeGuardian } from '@/core/guardian/runtimeGuardian'
import sessionFixture from '../fixtures/session-fixture.json'

describe('v3/invariants - Dry-Run Simulators', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let guardian: RuntimeGuardian

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    guardian = new RuntimeGuardian(supabase)

    db.sessions.set(sessionFixture.id, { ...sessionFixture } as any)
    db.events.set(sessionFixture.id, [])
  })

  it('debería calcular predictedState y riskScore en modo dry-run sin pausar la sesión', async () => {
    // Forzar desvío de continuidad en sesión para simular violación de R3
    const session = db.sessions.get(sessionFixture.id)
    if (session) {
      session.requires_revalidation = true
      db.sessions.set(sessionFixture.id, session)
    }

    const proposedAction = { type: 'STEP_ADVANCED', payload: { currentStep: 'declaration' } }
    
    // Ejecutar en DRY-RUN
    const dryResult = await guardian.evaluateInvariants(sessionFixture.id, sessionFixture.user_id, proposedAction, 'dry-run')

    expect(dryResult.passed).toBe(false)
    expect(dryResult.riskScore).toBeGreaterThan(0)
    expect(dryResult.predictedState).toBeDefined()
    expect(dryResult.predictedState.action).toBe('BLOCK')
    
    // En dry-run, el estado de la sesión no se congela a paused
    expect(db.sessions.get(sessionFixture.id)?.status).toBe('active')
  })

  it('debería congelar y aplicar penalizaciones en modo live si ocurre una violación', async () => {
    const session = db.sessions.get(sessionFixture.id)
    if (session) {
      session.requires_revalidation = true
      db.sessions.set(sessionFixture.id, session)
    }

    const proposedAction = { type: 'STEP_ADVANCED', payload: { currentStep: 'declaration' } }
    
    // Ejecutar en LIVE
    const liveResult = await guardian.evaluateInvariants(sessionFixture.id, sessionFixture.user_id, proposedAction, 'live')

    expect(liveResult.passed).toBe(false)
    // En live, el estado de la sesión debe ser congelado
    expect(db.sessions.get(sessionFixture.id)?.status).toBe('paused')
  })
})
