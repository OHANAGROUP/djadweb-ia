// frontend/src/services/sessionEngine.ts
/**
 * SessionEngine — Motor de gestión de sesiones de largo plazo con Event Sourcing y Cripto-Auditoría.
 *
 * Este servicio corre 100% del lado del servidor (Server-Side) para:
 * 1. Garantizar seguridad en la manipulación del historial y el Event Store.
 * 2. Permitir el uso del sistema de archivos local para sincronizar logs con Obsidian.
 * 3. Enlazar directamente a Supabase con políticas RLS de usuario.
 */

import { createHash } from 'crypto'
import { SupabaseClient } from '@supabase/supabase-js'

export interface Session {
  id: string
  user_id: string
  tramite_id: string
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  current_step: string
  progress: number
  started_at: string
  last_active_at: string
  expires_at?: string
  session_metadata: any
  created_at: string
}

export interface SessionEvent {
  id: string
  session_id: string
  user_id: string
  type: string // 'STEP_ADVANCED' | 'HELP_REQUESTED' | 'LLM_CALLED' | 'CONSENT_GRANTED' | 'SESSION_PAUSED' | 'SESSION_RESUMED'
  payload: any
  event_index: number
  previous_hash: string | null
  hash: string
  timestamp: string
}

export class SessionEngine {
  private supabase: SupabaseClient

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  /**
   * Genera el hash criptográfico SHA-256 para el encadenamiento de auditoría (Audit Chain).
   */
  public static calculateEventHash(
    previousHash: string | null,
    sessionId: string,
    userId: string,
    type: string,
    payload: any,
    eventIndex: number,
    timestamp: string
  ): string {
    const serializedPayload = JSON.stringify(payload || {})
    const dataString = `${previousHash || ''}|${sessionId}|${userId}|${type}|${serializedPayload}|${eventIndex}|${timestamp}`
    return createHash('sha256').update(dataString).digest('hex')
  }

  /**
   * Crea una nueva sesión persistente para un trámite.
   */
  public async createSession(
    userId: string,
    tramiteId: string,
    startingStep: string,
    metadata: any = {}
  ): Promise<Session> {
    const sessionData = {
      user_id: userId,
      tramite_id: tramiteId,
      status: 'active',
      current_step: startingStep,
      progress: 0,
      session_metadata: metadata,
    }

    const { data, error } = await this.supabase
      .from('tramite_sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) {
      throw new Error(`[SessionEngine] Error creando sesión: ${error.message}`)
    }

    // Registrar evento inicial de creación
    await this.addEvent(data.id, userId, 'SESSION_CREATED', {
      tramite_id: tramiteId,
      starting_step: startingStep,
      metadata,
    })

    return data as Session
  }

  /**
   * Recupera una sesión y todo su historial de eventos de forma ordenada.
   */
  public async resumeSession(sessionId: string): Promise<{ session: Session; events: SessionEvent[] }> {
    const { data: session, error: sError } = await this.supabase
      .from('tramite_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sError || !session) {
      throw new Error(`[SessionEngine] Sesión no encontrada: ${sError?.message || 'No existe'}`)
    }

    const { data: events, error: eError } = await this.supabase
      .from('tramite_session_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('event_index', { ascending: true })

    if (eError) {
      throw new Error(`[SessionEngine] Error cargando eventos: ${eError.message}`)
    }

    return {
      session: session as Session,
      events: (events || []) as SessionEvent[],
    }
  }

  /**
   * Añade un nuevo evento al Event Store de forma append-only, calculando su hash criptográfico.
   */
  public async addEvent(
    sessionId: string,
    userId: string,
    type: string,
    payload: any = {}
  ): Promise<SessionEvent> {
    // 1. Obtener el último evento para extraer el hash anterior e indexar
    const { data: lastEvents, error: leError } = await this.supabase
      .from('tramite_session_events')
      .select('hash, event_index')
      .eq('session_id', sessionId)
      .order('event_index', { ascending: false })
      .limit(1)

    if (leError) {
      throw new Error(`[SessionEngine] Error recuperando último evento: ${leError.message}`)
    }

    const lastEvent = lastEvents && lastEvents.length > 0 ? lastEvents[0] : null
    const nextIndex = lastEvent ? lastEvent.event_index + 1 : 0
    const prevHash = lastEvent ? lastEvent.hash : null
    const timestamp = new Date().toISOString()

    // 2. Calcular hash del nuevo nodo del ledger
    const hash = SessionEngine.calculateEventHash(
      prevHash,
      sessionId,
      userId,
      type,
      payload,
      nextIndex,
      timestamp
    )

    // 3. Insertar el evento
    const eventData = {
      session_id: sessionId,
      user_id: userId,
      type,
      payload,
      event_index: nextIndex,
      previous_hash: prevHash,
      hash,
      timestamp,
    }

    const { data: newEvent, error: insError } = await this.supabase
      .from('tramite_session_events')
      .insert([eventData])
      .select()
      .single()

    if (insError) {
      throw new Error(`[SessionEngine] Error insertando evento: ${insError.message}`)
    }

    // 4. Actualizar metadata, fecha de interacción y último paso en la sesión madre si aplica
    const updates: any = {
      last_active_at: timestamp,
    }

    if (type === 'STEP_ADVANCED') {
      updates.current_step = payload.currentStep
      updates.progress = payload.progress
    }

    const { error: updError } = await this.supabase
      .from('tramite_sessions')
      .update(updates)
      .eq('id', sessionId)

    if (updError) {
      console.error(`[SessionEngine] Advertencia: falló actualizar sesión madre: ${updError.message}`)
    }

    return newEvent as SessionEvent
  }

  /**
   * Pausa una sesión de largo plazo.
   */
  public async pauseSession(sessionId: string, userId: string): Promise<Session> {
    const timestamp = new Date().toISOString()
    const { data, error } = await this.supabase
      .from('tramite_sessions')
      .update({ status: 'paused', last_active_at: timestamp })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      throw new Error(`[SessionEngine] Error al pausar sesión: ${error.message}`)
    }

    await this.addEvent(sessionId, userId, 'SESSION_PAUSED', { paused_at: timestamp })
    return data as Session
  }

  /**
   * Completa de forma definitiva una sesión de trámite.
   */
  public async completeSession(sessionId: string, userId: string): Promise<Session> {
    const timestamp = new Date().toISOString()
    const { data, error } = await this.supabase
      .from('tramite_sessions')
      .update({ status: 'completed', last_active_at: timestamp })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      throw new Error(`[SessionEngine] Error al completar sesión: ${error.message}`)
    }

    await this.addEvent(sessionId, userId, 'SESSION_COMPLETED', { completed_at: timestamp })
    return data as Session
  }
}
