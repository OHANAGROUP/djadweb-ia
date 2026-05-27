import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Verificar token de Vercel Cron (opcional pero recomendado si se expone)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const backendUrl = process.env.SCRAPER_URL || 'http://localhost:3001'
    
    // Disparar background task en el backend (Node.js / Render)
    const res = await fetch(`${backendUrl}/api/internal/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      throw new Error(`Backend devolvió status ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error disparando cron:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
