import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { PLAN_QUOTAS } from '@/lib/plans';
import type { Plan } from '@/lib/plans';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SCRAPER_URL    = process.env.SCRAPER_URL;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// Tipos de consulta SII permitidos y a qué endpoint mapean
const TIPOS_PERMITIDOS: Record<string, string> = {
  basicos: 'basicos',
  deudas:  'deudas',
};

export async function POST(req: NextRequest) {
  try {
    // ── 1. Autenticación ─────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // ── 2. Validar body ──────────────────────────────────────────────
    const body = await req.json();
    const { tipo, rut } = body;

    if (!rut || typeof rut !== 'string' || !rut.trim()) {
      return NextResponse.json({ error: 'RUT requerido' }, { status: 400 });
    }

    // Tipo de consulta: validar contra lista blanca (previene path traversal)
    const tipoNormalizado = tipo || 'basicos';
    if (!TIPOS_PERMITIDOS[tipoNormalizado]) {
      return NextResponse.json(
        { error: `Tipo de consulta inválido. Use: ${Object.keys(TIPOS_PERMITIDOS).join(', ')}` },
        { status: 400 }
      );
    }
    const scraperEndpoint = TIPOS_PERMITIDOS[tipoNormalizado];

    // ── 3. Verificar plan — gate de acceso a SII ─────────────────────
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single();

    const plan = ((sub?.plan ?? 'free') as Plan);
    const quota = PLAN_QUOTAS[plan];

    // SII solo está disponible en planes que incluyen ese portal
    if (!quota.portales.includes('SII')) {
      return NextResponse.json(
        {
          error: `Tu plan "${plan}" no incluye consultas al SII. Actualiza a Plan PYME o Contadores para acceder.`,
          upgrade_required: true,
        },
        { status: 403 }
      );
    }

    // Verificar que la suscripción esté activa
    if (sub?.status !== 'active' && sub?.status !== 'trialing') {
      return NextResponse.json(
        { error: 'Tu suscripción no está activa.' },
        { status: 403 }
      );
    }

    // ── 4. Registrar la consulta (sin bloquear si falla) ─────────────
    supabase.from('sii_queries').insert({
      user_id:       user.id,
      tipo_consulta: tipoNormalizado,
      rut_consultado: rut.trim(),
      resultado: { status: 'pending' }
    }).then(({ error }) => {
      if (error) console.warn('[SII] Error guardando consulta:', error.message);
    });

    // ── 5. Proxy al scraper ──────────────────────────────────────────
    const scraperRes = await fetch(`${SCRAPER_URL}/api/sii/${scraperEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': SCRAPER_API_KEY || '',
      },
      body: JSON.stringify({ rut: rut.trim() }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!scraperRes.ok) {
      const errText = await scraperRes.text();
      console.error('[SII] Scraper respondió con error:', scraperRes.status, errText);
      return NextResponse.json(
        { error: 'Error al consultar el SII. Intenta nuevamente.' },
        { status: 502 }
      );
    }

    const data = await scraperRes.json();
    return NextResponse.json({ data, source: 'sii', plan });

  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'El portal del SII tardó demasiado. Inténtalo de nuevo.' },
        { status: 503 }
      );
    }
    console.error('[SII] Error inesperado:', err.message);
    return NextResponse.json(
      { error: 'Error interno. Por favor inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
