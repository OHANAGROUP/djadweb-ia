// ── Planes ────────────────────────────────────────────────────────────────────
// Re-exportamos los tipos y constantes desde plans.ts para mantener
// retrocompatibilidad con imports existentes. La fuente canónica es plans.ts.
import type { Plan, SubscriptionStatus } from '@/lib/plans'
export type { Plan, SubscriptionStatus } from '@/lib/plans'
export { PLAN_QUOTAS, PLAN_PRICES, PLANS, PRICE_TO_PLAN } from '@/lib/plans'

export interface Subscription {
  id: string
  user_id: string
  plan: Plan
  status: SubscriptionStatus
  mp_subscription_id: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

// ── Perfil ────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  nombre_completo: string | null
  rut: string | null
  telefono: string | null
  created_at: string
}

// ── Búsqueda PJUD ─────────────────────────────────────────────────────────────
export type Competencia =
  | 'civil' | 'laboral' | 'familia' | 'penal'
  | 'cobranza' | 'suprema' | 'apelaciones'

export interface SearchParams {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno?: string
  anio?: string
  competencia: Competencia
  corte?: string
  tribunal?: string
}

export interface Causa {
  rit: string
  caratulado: string
  tribunal: string
  estado: string
  fechaUltimaActuacion: string
  competencia: string
  urlDetalle?: string
}

export interface SearchResult {
  causas: Causa[]
  total: number
  fuente: string
  consultadoEn: string
  params: SearchParams
}

// ── Historial ─────────────────────────────────────────────────────────────────
export interface SearchRecord {
  id: string
  user_id: string
  params: SearchParams
  result: SearchResult | null
  ai_summary: string | null
  created_at: string
}

// ── Alertas ───────────────────────────────────────────────────────────────────
export interface Alert {
  id: string
  user_id: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string | null
  competencias: Competencia[]
  activa: boolean
  last_checked: string | null
  notify_email: boolean
  notify_whatsapp: boolean
  created_at: string
}

// ── API response ──────────────────────────────────────────────────────────────
export interface BuscarResponse {
  search_id: string
  result: SearchResult
  ai_summary?: string
  quota_used?: number
  quota_limit?: number | null
}

// ===== Chat IA =====
export interface ChatSession {
  id: string
  user_id: string
  title: string
  summary?: string
  message_count: number
  workflow_state?: any
  workflow_type?: string
  current_stage?: string
  risk_flags?: any
  missing_requirements?: any
  last_tool_used?: string
  completion_percentage?: number
  confidence_score?: number
  workflow_version?: string
  event_history?: any
  state_hash?: string
  last_verified_at?: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: any
  metadata?: any
  tokens_used?: number
  created_at: string
}

// ===== SII =====
export interface SiiQuery {
  id: string
  user_id: string
  tipo_consulta: string
  rut_consultado: string
  result: any | null
  created_at: string
}

// ===== TGR =====
export interface TgrQuery {
  id: string
  user_id: string
  tipo_consulta: string
  rut_consultado: string
  result: any | null
  created_at: string
}

// ===== Credenciales =====
export interface UserCredentials {
  id: string
  user_id: string
  rut_empresa: string
  sii_locked: boolean
  sii_last_sync: string | null
  created_at: string
}
