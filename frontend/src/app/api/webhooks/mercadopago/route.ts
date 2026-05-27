/**
 * Webhook de MercadoPago — actualiza el plan del usuario tras pago exitoso.
 *
 * Configurar en MercadoPago Developers → Webhooks:
 *   URL: https://tramitai.vercel.app/api/webhooks/mercadopago
 *   Eventos: payment, subscription_authorized_payment, subscription_preapproval
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import type { Plan } from '@/lib/types'

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || ''

// Mapa de precios MercadoPago → plan
const PRICE_TO_PLAN: Record<number, Plan> = {
  3990: 'basic',
  7990: 'premium',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body

    // Solo procesar pagos de suscripciones aprobados
    if (type !== 'payment' && type !== 'subscription_authorized_payment') {
      return NextResponse.json({ received: true })
    }

    // Obtener detalles del pago desde MercadoPago API
    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ received: true })

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    })

    if (!mpRes.ok) {
      console.error('[MP Webhook] No se pudo obtener el pago:', paymentId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 400 })
    }

    const payment = await mpRes.json()

    // Solo procesar pagos aprobados
    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true })
    }

    // Obtener el user_id desde metadata del pago
    const userId = payment.metadata?.user_id
    const amount = Math.round(payment.transaction_amount)

    if (!userId) {
      console.error('[MP Webhook] Pago sin user_id en metadata:', paymentId)
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const plan = PRICE_TO_PLAN[amount]
    if (!plan) {
      console.warn('[MP Webhook] Monto no reconocido:', amount)
      return NextResponse.json({ received: true })
    }

    // Actualizar suscripción en Supabase
    const supabase = createAdminClient()
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan,
      status: 'active',
      mp_subscription_id: payment.id?.toString(),
      mp_payer_id: payment.payer?.id?.toString(),
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    console.log(`[MP Webhook] Plan ${plan} activado para usuario ${userId}`)
    return NextResponse.json({ received: true, plan, user_id: userId })

  } catch (err) {
    console.error('[MP Webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
