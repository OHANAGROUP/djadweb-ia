/**
 * Webhook de MercadoPago — actualiza el plan del usuario tras pago exitoso.
 *
 * Seguridad:
 *  - Verifica firma HMAC-SHA256 (header x-signature) antes de procesar.
 *  - Valida timestamp para prevenir replay attacks (±5 minutos).
 *  - Idempotencia: verifica si el payment_id ya fue procesado.
 *
 * Configurar en MercadoPago Developers → Webhooks:
 *   URL: https://tramitai.vercel.app/api/webhooks/mercadopago
 *   Eventos: payment, subscription_authorized_payment
 *   Secret: definir en MP_WEBHOOK_SECRET (env var)
 */
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase-server'
import { PRICE_TO_PLAN } from '@/lib/plans'
import type { Plan } from '@/lib/plans'

const MP_ACCESS_TOKEN  = process.env.MP_ACCESS_TOKEN  || ''
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || ''

// Tolerancia para validación de timestamp: ±5 minutos
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000

// ── Verificación de firma HMAC ────────────────────────────────────────────────
function verifySignature(
  signature: string | null,
  requestId: string | null,
  paymentId: string | number,
  secret: string
): { valid: boolean; reason?: string } {
  if (!secret) {
    console.warn('[MP Webhook] MP_WEBHOOK_SECRET no configurado — verificación omitida en dev')
    return process.env.NODE_ENV === 'production'
      ? { valid: false, reason: 'MP_WEBHOOK_SECRET no configurado' }
      : { valid: true }
  }

  if (!signature || !requestId) {
    return { valid: false, reason: 'Faltan headers de firma (x-signature / x-request-id)' }
  }

  // Parsear "ts=<timestamp>,v1=<hmac>"
  const parts: Record<string, string> = {}
  for (const chunk of signature.split(',')) {
    const [k, v] = chunk.trim().split('=')
    if (k && v) parts[k] = v
  }

  const { ts, v1 } = parts
  if (!ts || !v1) {
    return { valid: false, reason: 'Formato de x-signature inválido' }
  }

  // Validar antigüedad del timestamp (replay protection)
  const signedAt = parseInt(ts, 10) * 1000 // MP usa segundos
  const delta = Math.abs(Date.now() - signedAt)
  if (delta > TIMESTAMP_TOLERANCE_MS) {
    return { valid: false, reason: `Timestamp fuera de rango (delta: ${delta}ms)` }
  }

  // Calcular HMAC esperado
  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts}`
  const expectedHex = createHmac('sha256', secret).update(manifest).digest('hex')

  // Comparación en tiempo constante para prevenir timing attacks
  try {
    const receivedBuf = Buffer.from(v1, 'hex')
    const expectedBuf = Buffer.from(expectedHex, 'hex')
    if (receivedBuf.length !== expectedBuf.length) {
      return { valid: false, reason: 'Longitud de HMAC inválida' }
    }
    const match = timingSafeEqual(receivedBuf, expectedBuf)
    return match ? { valid: true } : { valid: false, reason: 'HMAC no coincide' }
  } catch {
    return { valid: false, reason: 'Error al comparar HMAC' }
  }
}

// ── Handler principal ─────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // 1. Leer body como texto (necesario para calcular HMAC sobre el contenido)
    const rawBody = await request.text()
    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
    }

    const { type, data } = body

    // 2. Solo procesar eventos de pago
    if (type !== 'payment' && type !== 'subscription_authorized_payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ received: true })

    // 3. Verificar firma HMAC
    const signature  = request.headers.get('x-signature')
    const requestId  = request.headers.get('x-request-id')
    const { valid, reason } = verifySignature(signature, requestId, paymentId, MP_WEBHOOK_SECRET)

    if (!valid) {
      console.error('[MP Webhook] Firma inválida:', reason, { paymentId })
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }

    // 4. Obtener detalles del pago desde la API de MercadoPago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    })

    if (!mpRes.ok) {
      console.error('[MP Webhook] No se pudo obtener pago:', paymentId, mpRes.status)
      return NextResponse.json({ error: 'Payment not found' }, { status: 400 })
    }

    const payment = await mpRes.json()

    // 5. Solo procesar pagos aprobados
    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true, status: payment.status })
    }

    // 6. Idempotencia: verificar si ya fue procesado
    const supabase   = createAdminClient()
    const mpPaymentId = payment.id?.toString()

    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('mp_subscription_id', mpPaymentId)
      .maybeSingle()

    if (existing) {
      console.log('[MP Webhook] Pago ya procesado (idempotent):', mpPaymentId)
      return NextResponse.json({ received: true, idempotent: true })
    }

    // 7. Resolver plan desde precio — única fuente: plans.ts
    const userId = payment.metadata?.user_id
    const amount = Math.round(payment.transaction_amount)

    if (!userId) {
      console.error('[MP Webhook] Pago sin user_id en metadata:', mpPaymentId)
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const plan: Plan | undefined = PRICE_TO_PLAN[amount]
    if (!plan) {
      console.warn('[MP Webhook] Monto no reconocido:', amount, '— Payment ID:', mpPaymentId)
      // No fallar: retornar 200 para que MP no reintente; solo loguear para revisión manual.
      return NextResponse.json({ received: true, warning: 'amount_not_mapped' })
    }

    // 8. Activar suscripción en Supabase
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const { error: upsertError } = await supabase.from('subscriptions').upsert({
      user_id:               userId,
      plan,
      status:                'active',
      mp_subscription_id:    mpPaymentId,
      mp_payer_id:           payment.payer?.id?.toString(),
      current_period_start:  new Date().toISOString(),
      current_period_end:    periodEnd.toISOString(),
      updated_at:            new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (upsertError) {
      console.error('[MP Webhook] Error al activar suscripción:', upsertError)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    console.log(`[MP Webhook] Plan "${plan}" activado para usuario ${userId} | Payment ${mpPaymentId}`)
    return NextResponse.json({ received: true, plan, user_id: userId })

  } catch (err) {
    console.error('[MP Webhook] Error inesperado:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
