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
    const { rut } = body;

    if (!rut) {
      return NextResponse.json({ error: 'RUT requerido' }, { status: 400 });
    }

    // Save query
    await supabase.from('tgr_queries').insert({
      user_id: user.id,
      tipo_consulta: 'deuda_simple',
      rut_consultado: rut
    });

    // Proxy to scraper
    const res = await fetch(`${SCRAPER_URL}/api/tgr/deuda`, {
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
      return NextResponse.json({ error: 'Error al consultar TGR: ' + errText }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ data, source: 'tgr' });
  } catch (err: any) {
    console.error('TGR API error:', err);
    return NextResponse.json({ error: 'Error al consultar TGR: ' + (err.message || 'Error interno') }, { status: 500 });
  }
}
