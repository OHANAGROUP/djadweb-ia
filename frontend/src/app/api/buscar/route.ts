import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import type { SearchParams, Plan } from '@/lib/types'
import { PLAN_QUOTAS } from '@/lib/types'

const SCRAPER_URL  = process.env.SCRAPER_URL  || 'http://localhost:3000'
const SCRAPER_KEY  = process.env.SCRAPER_API_KEY || ''
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ''

// Límite de tiempo para el scraper (Playwright puede tardar hasta 30s)
const SCRAPER_TIMEOUT = 45_000

export async function POST(request: Request) {
  try {
    // ── 1. Verificar autenticación ────────────────────────────────
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    // ── 2. Leer y validar el body ─────────────────────────────────
    const body: SearchParams = await request.json()
    const { nombre, apellidoPaterno, competencia } = body

    if (!nombre?.trim() || !apellidoPaterno?.trim() || !competencia) {
      return NextResponse.json({ error: 'nombre, apellidoPaterno y competencia son requeridos.' }, { status: 400 })
    }

    // ── 3. Obtener plan del usuario ───────────────────────────────
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single()

    const plan = ((subscription?.plan as Plan) || 'free')
    const quota = PLAN_QUOTAS[plan]

    // ── 4. Verificar cuota mensual (solo plan free) ────────────────
    if (quota.searches !== null) {
      const { data: monthlyCount } = await supabase
        .rpc('get_monthly_search_count', { p_user_id: user.id })

      if ((monthlyCount || 0) >= quota.searches) {
        return NextResponse.json(
          { error: `Cuota mensual alcanzada (${quota.searches} consultas). Actualiza tu plan para continuar.` },
          { status: 429 }
        )
      }
    }

    // ── 5. Llamar al scraper PJUD ─────────────────────────────────
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT)

    let scraperResult
    try {
      const scraperRes = await fetch(`${SCRAPER_URL}/api/pjud/nombre`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': SCRAPER_KEY,
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellidoPaterno: apellidoPaterno.trim(),
          apellidoMaterno: body.apellidoMaterno?.trim() || '',
          anio: body.anio || '',
          competencia,
          corte: body.corte || '',
          tribunal: body.tribunal || '',
        }),
        signal: controller.signal,
      })

      if (!scraperRes.ok) {
        const err = await scraperRes.json().catch(() => ({}))
        throw new Error(err.error || `El scraper respondió ${scraperRes.status}`)
      }

      scraperResult = await scraperRes.json()
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'El portal del Poder Judicial tardó demasiado. Inténtalo de nuevo.' },
          { status: 503 }
        )
      }
      // Error de conexión con el scraper (servicio caído, DNS, etc.)
      const isNetError = err.cause?.code === 'ECONNREFUSED'
        || err.cause?.code === 'ENOTFOUND'
        || err.cause?.code === 'ECONNRESET'
        || err.code === 'ECONNREFUSED'
        || err.code === 'ENOTFOUND'
        || err.code === 'ECONNRESET'
        || (err.name === 'TypeError' && err.message?.includes('fetch failed'))
      if (isNetError) {
        console.error('[/api/buscar] Scraper no disponible:', err.message)
        return NextResponse.json(
          { error: 'El servicio de consultas judiciales no está disponible en este momento. Por favor intenta más tarde o contacta a soporte.' },
          { status: 503 }
        )
      }
      // Scraper respondió con error (404, 500, etc.)
      if (err.message && (err.message.includes('respondió') || err.message.includes('scraper'))) {
        console.error('[/api/buscar] Scraper respondió con error:', err.message)
        return NextResponse.json(
          { error: 'El servicio de consultas judiciales está temporalmente fuera de servicio (error: ' + err.message + '). Intenta de nuevo en unos minutos.' },
          { status: 503 }
        )
      }
      // Otros errores: relanzar para el catch general
      throw err
    } finally {
      clearTimeout(timeout)
    }

    // ── 6. Resumen automatización (solo plan premium) ─────────────────────────
    let aiSummary: string | null = null
    if (quota.ai && ANTHROPIC_KEY && scraperResult.total > 0) {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default
        const client = new Anthropic({ apiKey: ANTHROPIC_KEY })

        const causasResumen = scraperResult.causas.slice(0, 5).map((c: any) =>
          `• RIT ${c.rit} — ${c.caratulado || 'Sin carátula'} — Tribunal: ${c.tribunal} — Estado: ${c.estado}`
        ).join('\n')

        const msg = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Eres un asistente legal chileno. Explica en lenguaje simple y sin tecnicismos (máximo 3 oraciones) qué significan estos resultados judiciales para una persona común. No des consejos legales específicos. Solo explica qué es lo que encontraste.

Persona buscada: ${nombre} ${apellidoPaterno}
Competencia: ${competencia}
Total causas: ${scraperResult.total}

Causas encontradas:
${causasResumen}

Responde en español, lenguaje directo y claro, en 2-3 oraciones.`,
          }],
        })
        aiSummary = msg.content[0].type === 'text' ? msg.content[0].text : null
      } catch (aiErr) {
        console.error('[AI Summary] Error:', aiErr)
        // No fallar la búsqueda si la automatización falla
      }
    }

    // ── 7. Guardar en historial ───────────────────────────────────
    const admin = createAdminClient()
    const { data: savedSearch } = await admin.from('searches').insert({
      user_id: user.id,
      params: body,
      result: scraperResult,
      ai_summary: aiSummary,
    }).select('id').single()

    // ── 8. Retornar respuesta ─────────────────────────────────────
    const monthlyCountAfter = quota.searches !== null
      ? await supabase.rpc('get_monthly_search_count', { p_user_id: user.id }).then(r => r.data)
      : null

    return NextResponse.json({
      search_id: savedSearch?.id,
      result: scraperResult,
      ai_summary: aiSummary || undefined,
      quota_used:  quota.searches !== null ? monthlyCountAfter : undefined,
      quota_limit: quota.searches,
    })

  } catch (err: any) {
    console.error('[/api/buscar] Error:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor. Por favor inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}
