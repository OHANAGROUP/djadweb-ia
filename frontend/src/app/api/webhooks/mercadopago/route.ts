import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase-server'
import { PRICE_TO_PLAN } from '@/lib/plans'
import type { Plan } from '@/lib/plans'

const MP_ACCESS_TOKEN  = process.env.MP_ACCESS_TOKEN  || ''
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || ''
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000

function verifySignature(
  signature: string | null,
  requestId: string | null,
  paymentId: string | number,
  secret: string
): { valid: boolean; reason?: string } {
  if (!secret) {
    return process.env.NODE_ENV === 'production'
      ? { valid: false, reason: 'MP_WEBHOOK_SECRET no configurado' }
      : { valid: true }
  }

  if (!signature || !requestId) {
    return { valid: false, reason: 'Faltan headers' }
  }

  const parts: Record<string, string> = {}
  for (const chunk of signature.split(',')) {
    const [k, v] = chunk.trim().split('=')
    if (k && v) parts[k] = v
  }

  const { ts, v1 } = parts
  if (!ts || !v1) return { valid: false, reason: 'Formato invalido' }

  const signedAt = parseInt(ts, 10) * 1000
  const delta = Math.abs(Date.now() - signedAt)
  if (delta > TIMESTAMP_TOLERANCE_MS) return { valid: false, reason: 'Timestamp antiguo' }

  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts}`
  const expectedHex = createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    const receivedBuf = Buffer.from(v1, 'hex')
    const expectedBuf = Buffer.from(expectedHex, 'hex')
    if (receivedBuf.length !== expectedBuf.length) return { valid: false, reason: 'Longitud HMAC' }
    const match = timingSafeEqual(receivedBuf, expectedBuf)
    return match ? { valid: true } : { valid: false, reason: 'HMAC mismatch' }
  } catch {
    return { valid: false, reason: 'Error parse' }
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    let body: any
    try { body = JSON.parse(rawBody) } catch { return NextResponse.json({ error: 'Body invalido' }, { status: 400 }) }

    const { type, data } = body
    if (type !== 'payment') return NextResponse.json({ received: true })

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ received: true })

    const signature  = request.headers.get('x-signature')
    const requestId  = request.headers.get('x-request-id')
    const { valid } = verifySignature(signature, requestId, paymentId, MP_WEBHOOK_SECRET)

    if (!valid) {
      return NextResponse.json({ error: 'Firma invalida' }, { status: 401 })
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    })

    if (!mpRes.ok) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 400 })
    }

    const payment = await mpRes.json()
    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true, status: payment.status })
    }

    const userId = payment.metadata?.user_id
    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Determinar el plan segun el monto pagado (fuente unica de verdad: plans.ts)
    const amountPaid: number = payment.transaction_details?.total_paid_amount
      ?? payment.transaction_amount
      ?? 0
    const resolvedPlan: Plan = PRICE_TO_PLAN[amountPaid] ?? 'basic'
    const isPro = resolvedPlan === 'premium'

    // Actualizar perfil
    const { error: upsertError } = await supabase.from('profiles').update({
      is_pro: isPro,
      updated_at: new Date().toISOString()
    }).eq('id', userId)

    if (upsertError) {
      console.error('[MP Webhook] Error update profile:', upsertError)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // Registrar en subscriptions (idempotente por user_id)
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan: resolvedPlan,
      status: 'active',
      mp_subscription_id: payment.id?.toString(),
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    console.log(`[MP Webhook] Plan "${resolvedPlan}" activado para usuario ${userId} (monto: ${amountPaid})`)
    return NextResponse.json({ received: true, plan: resolvedPlan, is_pro: isPro, user_id: userId })

  } catch (err) {
    console.error('[MP Webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
