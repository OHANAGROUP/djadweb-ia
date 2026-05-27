/**
 * plans.ts — Fuente única de verdad para planes, precios y quotas.
 *
 * REGLA: Todo código que necesite conocer precios, nombres o features
 * de planes DEBE importar desde aquí. Nunca hardcodear en componentes,
 * rutas API o webhooks.
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────
export type Plan = 'free' | 'basic' | 'premium'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'

export interface PlanQuota {
  /** null = ilimitado */
  searches: number | null
  portales: string[]
  alerts: boolean
  ai: boolean
  maxRuts: number
}

export interface PlanMeta {
  id: Plan
  /** Nombre visible al usuario */
  displayName: string
  tagline: string
  /** null = plan gratuito */
  clp: number | null
  quota: PlanQuota
  features: string[]
  notFeatures: string[]
}

// ── Definición de planes ──────────────────────────────────────────────────────
export const PLANS: Record<Plan, PlanMeta> = {
  free: {
    id: 'free',
    displayName: 'Plan Ciudadano',
    tagline: 'Para comenzar sin costo',
    clp: null,
    quota: {
      searches: 3,
      portales: ['PJUD'],
      alerts: false,
      ai: false,
      maxRuts: 1,
    },
    features: [
      '3 consultas mensuales',
      'Poder Judicial (PJUD)',
      'Historial básico 30 días',
      'Alertas por email (mensual)',
    ],
    notFeatures: [
      'Consultas SII y TGR',
      'Alertas inmediatas',
      'Resúmenes con IA',
      'Soporte prioritario',
    ],
  },

  basic: {
    id: 'basic',
    displayName: 'Plan PYME',
    tagline: 'Para pymes y emprendedores',
    clp: 14_990,
    quota: {
      searches: null, // ilimitado
      portales: ['PJUD', 'SII', 'TGR'],
      alerts: true,
      ai: false,
      maxRuts: 3,
    },
    features: [
      'Consultas ilimitadas',
      'SII, TGR y Poder Judicial',
      'Hasta 3 RUTs activos',
      'Alertas inmediatas por email',
      'Historial 3 meses',
      'Asistente tributario incluido',
    ],
    notFeatures: [
      'Resúmenes con IA',
      'Panel multi-cliente',
    ],
  },

  premium: {
    id: 'premium',
    displayName: 'Plan Contadores',
    tagline: 'Para contadores con cartera de clientes',
    clp: 39_990,
    quota: {
      searches: null, // ilimitado
      portales: ['PJUD', 'SII', 'TGR'],
      alerts: true,
      ai: true,
      maxRuts: 15,
    },
    features: [
      'Hasta 15 RUTs activos',
      'Todos los portales',
      'Resúmenes IA por consulta',
      'Alertas inmediatas por email',
      'Historial ilimitado',
      'Soporte prioritario',
    ],
    notFeatures: [],
  },
}

// ── Helpers de acceso rápido ──────────────────────────────────────────────────

/** Quotas en el formato plano que espera el código de rutas API */
export const PLAN_QUOTAS: Record<Plan, PlanQuota> = {
  free:    PLANS.free.quota,
  basic:   PLANS.basic.quota,
  premium: PLANS.premium.quota,
}

/** Solo planes de pago con precio garantizado */
export const PAID_PLANS = Object.values(PLANS).filter(
  (p): p is PlanMeta & { clp: number } => p.clp !== null
)

/**
 * Mapa precio CLP → Plan.
 * Único lugar donde se define qué monto activa qué plan.
 * El webhook de MercadoPago DEBE importar esto.
 */
export const PRICE_TO_PLAN: Record<number, Plan> = Object.fromEntries(
  PAID_PLANS.map(p => [p.clp, p.id])
) as Record<number, Plan>

/** Precios en el formato { clp, label } que usan formularios y CTAs */
export const PLAN_PRICES: Record<Exclude<Plan, 'free'>, { clp: number; label: string }> = {
  basic:   { clp: PLANS.basic.clp!,   label: `$${PLANS.basic.clp!.toLocaleString('es-CL')}/mes` },
  premium: { clp: PLANS.premium.clp!, label: `$${PLANS.premium.clp!.toLocaleString('es-CL')}/mes` },
}
