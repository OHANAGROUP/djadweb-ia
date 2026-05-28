import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SCRAPER_URL = process.env.SCRAPER_URL;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPing = searchParams.get('ping') === 'true';
  const startTotal = Date.now();

  const healthReport: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      supabase: { status: 'unknown', latency_ms: 0 },
      scraper: { status: 'unknown', latency_ms: 0 }
    },
    keep_alive_triggered: isPing
  };

  const supabase = createAdminClient();

  // 1. Verificar Supabase
  const startSupa = Date.now();
  try {
    const { data, error } = await supabase.from('tramite_sessions').select('id').limit(1);
    if (error) throw error;
    healthReport.services.supabase.status = 'healthy';
    healthReport.services.supabase.latency_ms = Date.now() - startSupa;
  } catch (err: any) {
    healthReport.status = 'unhealthy';
    healthReport.services.supabase.status = 'unhealthy';
    healthReport.services.supabase.error = err.message || 'Error al conectar con Supabase';
  }

  // 2. Verificar Render Scraper (con Keep-Alive condicional)
  if (SCRAPER_URL) {
    const startScraper = Date.now();
    try {
      const res = await fetch(SCRAPER_URL, {
        method: 'GET',
        signal: AbortSignal.timeout(15000)
      });
      
      healthReport.services.scraper.status = res.ok ? 'healthy' : 'unhealthy';
      healthReport.services.scraper.latency_ms = Date.now() - startScraper;
      if (!res.ok) {
        healthReport.status = 'degraded';
      }
    } catch (err: any) {
      // Si el scraper está dormido (plan free de Render), marcar como degraded/despertando
      healthReport.status = 'degraded';
      healthReport.services.scraper.status = 'unhealthy';
      healthReport.services.scraper.error = err.message || 'Error al conectar con el Scraper de Render';
    }
  } else {
    healthReport.services.scraper.status = 'disabled';
    healthReport.services.scraper.error = 'SCRAPER_URL no configurada';
  }

  healthReport.total_latency_ms = Date.now() - startTotal;

  return NextResponse.json(healthReport, {
    status: healthReport.status === 'unhealthy' ? 500 : 200
  });
}
