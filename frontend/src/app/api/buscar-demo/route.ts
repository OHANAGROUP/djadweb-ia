import { NextResponse } from 'next/server'
import type { SearchParams } from '@/lib/types'

const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:3000'
const SCRAPER_KEY = process.env.SCRAPER_API_KEY || ''
const SCRAPER_TIMEOUT = 45_000

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body: SearchParams = await request.json()
    const { nombre, apellidoPaterno, competencia } = body

    if (!nombre?.trim() || !apellidoPaterno?.trim() || !competencia) {
      return NextResponse.json({ error: 'nombre, apellidoPaterno y competencia son requeridos.' }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT)

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

      const data = await scraperRes.json()
      return NextResponse.json(data)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'El portal del Poder Judicial tardó demasiado. Inténtalo de nuevo.' },
          { status: 503 }
        )
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  } catch (err: any) {
    console.error('[/api/buscar-demo] Error:', err)
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
