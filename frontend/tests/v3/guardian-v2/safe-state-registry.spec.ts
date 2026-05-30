// tests/v3/guardian-v2/safe-state-registry.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseDatabase, createMockSupabaseClient } from '../utils/supabase-mock'
import { SafeStateRegistry } from '@/core/guardian/safeStateRegistry'

describe('v3/guardian-v2 - Safe State Registry Tests', () => {
  let db: MockSupabaseDatabase
  let supabase: any
  let registry: SafeStateRegistry

  beforeEach(() => {
    db = new MockSupabaseDatabase()
    supabase = createMockSupabaseClient(db)
    registry = new SafeStateRegistry(supabase)
  })

  it('debería registrar un estado seguro en caliente y persistirlo en Supabase', async () => {
    const sessionId = 'session-safe-123'
    const state = 'declaration'
    const hash = 'sha-hash-123'
    const checkpoint = '5'

    const saved = await registry.registerSafeState(sessionId, state, hash, checkpoint)
    expect(saved.lastValidKnownState).toBe(state)
    expect(saved.lastValidHashChain).toBe(hash)
    expect(saved.lastIdempotencyCheckpoint).toBe(checkpoint)

    // Limpiar memoria para forzar lectura desde la base de datos mock
    registry.clearMemory()

    const retrieved = await registry.getSafeState(sessionId)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.lastValidKnownState).toBe(state)
    expect(retrieved?.lastValidHashChain).toBe(hash)
    expect(retrieved?.lastIdempotencyCheckpoint).toBe(checkpoint)
  })
})
