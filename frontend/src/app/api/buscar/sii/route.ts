import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SCRAPER_URL = process.env.SCRAPER_URL;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { tipo, rut } = body;

    if (!rut) {
      return NextResponse.json({ error: 'RUT requerido' }, { status: 400 });
    }

    // Check quota
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    const plan = (sub?.plan as string) || 'free';

    // Save query
    await supabase.from('sii_queries').insert({
      user_id: user.id,
      tipo_consulta: tipo || 'datos_basicos',
      rut_consultado: rut,
      resultado: { status: 'pending' }
    });

    // Proxy to scraper
    const res = await fetch(`${SCRAPER_URL}/api/sii/${tipo || 'basicos'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': SCRAPER_API_KEY || ''
      },
      body: JSON.stringify({ rut }),
      signal: AbortSignal.timeout(45000)
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: 'Error al consultar SII: ' + errText }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ data, source: 'sii' });
  } catch (err: any) {
    console.error('SII API error:', err);
    return NextResponse.json({ error: 'Error al consultar SII: ' + (err.message || 'Error interno') }, { status: 500 });
  }
}
