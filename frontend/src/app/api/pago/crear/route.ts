/**
 * Crea una preferencia de pago en MercadoPago y redirige al checkout.
 * GET /api/pago/crear?plan=basic|premium
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { PLAN_PRICES } from '@/lib/types'

export const dynamic = 'force-dynamic'


const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan') as 'basic' | 'premium' | null

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: 'Plan inválido.' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))

    // Crear preferencia en MercadoPago
    const preference = {
      items: [{
        id: `djadwebia-${plan}`,
        title: `DJADWEB-IA® Plan ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
        quantity: 1,
        unit_price: PLAN_PRICES[plan].clp,
        currency_id: 'CLP',
      }],
      payer: { email: user.email },
      metadata: { user_id: user.id, plan },
      back_urls: {
        success: `${APP_URL}/dashboard?pago=ok`,
        failure: `${APP_URL}/dashboard?pago=error`,
        pending: `${APP_URL}/dashboard?pago=pendiente`,
      },
      auto_return: 'approved',
      notification_url: `${APP_URL}/api/webhooks/mercadopago`,
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    })

    if (!mpRes.ok) {
      const err = await mpRes.json()
      console.error('[Pago] Error MP:', err)
      return NextResponse.json({ error: 'No se pudo iniciar el pago.' }, { status: 500 })
    }

    const { init_point } = await mpRes.json()
    return NextResponse.redirect(init_point)

  } catch (err) {
    console.error('[Pago] Error:', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
