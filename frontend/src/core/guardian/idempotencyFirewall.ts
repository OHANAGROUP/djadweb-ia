// src/core/guardian/idempotencyFirewall.ts
/**
 * IdempotencyFirewall — Cortafuegos de Doble Ejecución de Efectos Secundarios.
 *
 * Registra y valida de forma transaccional la ejecución de eventos UNSAFE
 * (pagos, firmas, envíos de formularios), impidiendo su procesamiento repetido.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export class IdempotencyFirewall {
  private supabase: SupabaseClient

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  /**
   * Comprueba si un evento crítico de tipo UNSAFE puede ser ejecutado.
   */
  public async shouldExecute(eventId: string, sessionId: string): Promise<boolean> {
    const executed = await this.isExecuted(eventId)
    return !executed
  }

  /**
   * Marca un evento como ejecutado en el registro operacional del firewall.
   */
  public async markExecuted(
    eventId: string,
    sessionId: string,
    status: 'executed' | 'blocked' | 'skipped' = 'executed',
    reason?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('event_execution_log')
      .insert([
        {
          event_id: eventId,
          session_id: sessionId,
          status,
          reason,
          timestamp: new Date().toISOString(),
        },
      ])

    if (error) {
      console.error(`[IdempotencyFirewall] Advertencia: no se pudo registrar execution log: ${error.message}`)
    }
  }

  /**
   * Comprueba si un ID de evento ya fue ejecutado previamente.
   */
  public async isExecuted(eventId: string): Promise<boolean> {
    if (!eventId) return false

    const { data, error } = await this.supabase
      .from('event_execution_log')
      .select('event_id')
      .eq('event_id', eventId)
      .limit(1)

    if (error || !data || data.length === 0) {
      return false
    }

    return true
  }
}
