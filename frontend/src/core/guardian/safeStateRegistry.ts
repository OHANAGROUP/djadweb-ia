// src/core/guardian/safeStateRegistry.ts
/**
 * SafeStateRegistry — Registro de Estados Seguros.
 *
 * Actúa como Single Source of Truth (SSoT) del Guardian. Define el último estado
 * operacional conocido, el último hash chain validado y el último checkpoint idempotente.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface SafeState {
  lastValidKnownState: string
  lastValidHashChain: string | null
  lastIdempotencyCheckpoint: string | null
}

export class SafeStateRegistry {
  private supabase: SupabaseClient
  private memoryCache: Map<string, SafeState> = new Map()

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  /**
   * Obtiene el último estado seguro registrado para una sesión.
   */
  public async getSafeState(sessionId: string): Promise<SafeState | null> {
    // 1. Verificar cache en memoria para rendimiento óptimo
    if (this.memoryCache.has(sessionId)) {
      return this.memoryCache.get(sessionId)!
    }

    // 2. Consultar base de datos (guardian_state)
    const { data, error } = await this.supabase
      .from('guardian_state')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error || !data) {
      return null
    }

    const safeState: SafeState = {
      lastValidKnownState: data.state || 'onboarding',
      lastValidHashChain: data.last_integrity_hash || null,
      lastIdempotencyCheckpoint: data.last_safe_event_index?.toString() || null,
    }

    this.memoryCache.set(sessionId, safeState)
    return safeState
  }

  /**
   * Registra un nuevo estado seguro validado.
   */
  public async registerSafeState(
    sessionId: string,
    state: string,
    hash: string | null,
    checkpoint: string | null
  ): Promise<SafeState> {
    const safeState: SafeState = {
      lastValidKnownState: state,
      lastValidHashChain: hash,
      lastIdempotencyCheckpoint: checkpoint,
    }

    this.memoryCache.set(sessionId, safeState)

    // Persistir en guardian_state
    await this.supabase.from('guardian_state').upsert({
      session_id: sessionId,
      state: state,
      last_safe_event_index: checkpoint ? parseInt(checkpoint, 10) : 0,
      last_integrity_hash: hash,
      updated_at: new Date().toISOString(),
    })

    return safeState
  }

  /**
   * Limpia el caché en memoria (principalmente para pruebas).
   */
  public clearMemory(): void {
    this.memoryCache.clear()
  }
}
