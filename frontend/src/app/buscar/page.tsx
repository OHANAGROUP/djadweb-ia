'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import type { BuscarResponse, Causa, Competencia } from '@/lib/types'

const COMPETENCIAS: { value: Competencia; label: string }[] = [
  { value: 'civil',       label: 'Civil' },
  { value: 'laboral',     label: 'Laboral' },
  { value: 'familia',     label: 'Familia' },
  { value: 'penal',       label: 'Penal' },
  { value: 'cobranza',    label: 'Cobranza' },
  { value: 'suprema',     label: 'Corte Suprema' },
  { value: 'apelaciones', label: 'Corte de Apelaciones' },
]

const CORTES = [
  'C.A. de Santiago',
  'C.A. de San Miguel',
  'C.A. de Valparaíso',
  'C.A. de Concepción',
  'C.A. de La Serena',
  'C.A. de Antofagasta',
  'C.A. de Rancagua',
  'C.A. de Talca',
  'C.A. de Temuco',
  'C.A. de Valdivia',
  'C.A. de Puerto Montt',
  'C.A. de Arica',
  'C.A. de Iquique',
  'C.A. de Copiapó',
  'C.A. de Chillan',
  'C.A. de Coyhaique',
  'C.A. de Punta Arenas',
]

const LOADING_MSGS = [
  '🔍 Conectando con el Poder Judicial...',
  '⚖️ Buscando causas judiciales...',
  '📋 Procesando resultados...',
]

export default function BuscarPage() {
  const [form, setForm] = useState({
    nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    anio: '', competencia: 'civil' as Competencia, corte: '', tribunal: '',
  })
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [data, setData] = useState<BuscarResponse | null>(null)
  const [error, setError] = useState('')
  const [quotaError, setQuotaError] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setData(null)
    setQuotaError(false)

    // Rotar mensajes de carga mientras espera (el scraper tarda 15-30s)
    const interval = setInterval(() => {
      setLoadingMsg(prev => (prev + 1) % LOADING_MSGS.length)
    }, 4000)

    try {
      const res = await fetch('/api/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const json = await res.json()

      if (res.status === 429) { setQuotaError(true); return }
      if (!res.ok) throw new Error(json.error || 'Error al consultar')

      setData(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px', maxWidth: 760 }}>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', marginBottom: 6 }}>
          Buscar en el Poder Judicial
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 32 }}>
          Consulta causas judiciales por nombre de persona natural.
        </p>

        {/* ── FORMULARIO ── */}
        <form onSubmit={handleSearch} className="card" style={{ padding: '28px 24px', marginBottom: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="form-label">Nombre *</label>
              <input className="form-input" name="nombre" value={form.nombre}
                onChange={handleChange} placeholder="Juan" required />
            </div>
            <div>
              <label className="form-label">Apellido paterno *</label>
              <input className="form-input" name="apellidoPaterno" value={form.apellidoPaterno}
                onChange={handleChange} placeholder="González" required />
            </div>
            <div>
              <label className="form-label">Apellido materno</label>
              <input className="form-input" name="apellidoMaterno" value={form.apellidoMaterno}
                onChange={handleChange} placeholder="Opcional" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <label className="form-label">Competencia *</label>
              <select className="form-select" name="competencia" value={form.competencia} onChange={handleChange}>
                {COMPETENCIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Año (opcional)</label>
              <input className="form-input" name="anio" value={form.anio}
                onChange={handleChange} placeholder="Ej: 2023" maxLength={4} />
            </div>
          </div>

          {form.competencia !== 'suprema' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="form-label">Corte de Apelaciones *</label>
                <select className="form-select" name="corte" value={form.corte} onChange={handleChange} required>
                  <option value="">Selecciona una Corte...</option>
                  {CORTES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {form.competencia !== 'apelaciones' && (
                <div>
                  <label className="form-label">Tribunal (opcional)</label>
                  <input className="form-input" name="tribunal" value={form.tribunal}
                    onChange={handleChange} placeholder="Ej: 1º Juzgado Civil de Santiago" />
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4, display: 'block' }}>
                    Si se deja en blanco, se buscará en el tribunal principal de la corte.
                  </span>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> {LOADING_MSGS[loadingMsg]}</>
              : '🔍 Buscar en el Poder Judicial'}
          </button>

          {loading && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 10 }}>
              El portal del PJUD puede tardar 15–30 segundos. Por favor espera.
            </p>
          )}
        </form>

        {/* ── ERROR DE CUOTA ── */}
        {quotaError && (
          <div style={{ background: '#fff8f0', border: '1px solid #ffe0c0', borderRadius: 14, padding: '24px', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Cuota mensual alcanzada</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
              El plan gratuito incluye 3 consultas por mes. Sube al plan Básico para consultas ilimitadas.
            </p>
            <a href="/dashboard#planes" className="btn btn-orange">Ver planes →</a>
          </div>
        )}

        {/* ── ERROR GENERAL ── */}
        {error && (
          <div style={{ background: 'var(--red-light)', border: '1px solid #f5c6c6', color: 'var(--red)', borderRadius: 12, padding: '16px 18px', fontSize: 14, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠️ Error al consultar</div>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{error}</p>
            
            {/* Fallback de UI Degradada para robustez de experiencia de usuario */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed #f5c6c6', fontSize: 12, color: 'var(--gray-700)' }}>
              <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--red)' }}>
                🚨 ¿Los servidores estatales están caídos o lentos?
              </p>
              <p style={{ margin: '0 0 10px', lineHeight: 1.5 }}>
                Estamos experimentando una alta latencia en los portales del Estado chileno. Para evitar esperas innecesarias, puedes activar una <strong>alerta proactiva</strong>. Buscaremos de forma asíncrona y te notificaremos al correo tan pronto aparezca información relevante.
              </p>
              <a href="/dashboard/alertas" className="btn btn-sm btn-orange" style={{ textDecoration: 'none', display: 'inline-block', fontSize: 11, padding: '4px 10px' }}>
                🔔 Agendar Alerta por Email
              </a>
            </div>
          </div>
        )}

        {/* ── RESULTADOS ── */}
        {data && (
          <div>
            {/* Header de resultados */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  {data.result.total} {data.result.total === 1 ? 'causa encontrada' : 'causas encontradas'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 10 }}>
                  Fuente: {data.result.fuente}
                </span>
              </div>
              {data.quota_limit && (
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                  {data.quota_used}/{data.quota_limit} consultas este mes
                </span>
              )}
            </div>

            {/* Resumen IA */}
            {data.ai_summary && (
              <div style={{ background: '#fff8f0', border: '1px solid #ffe0c0', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>🤖</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--brand-orange)', marginBottom: 6 }}>
                      Resumen IA
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.7, margin: 0 }}>
                      {data.ai_summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sin resultados */}
            {data.result.total === 0 && (
              <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Sin causas encontradas</h3>
                <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
                  No se encontraron causas para <strong>{form.nombre} {form.apellidoPaterno}</strong>{' '}
                  en la competencia <strong>{form.competencia}</strong>.
                </p>
              </div>
            )}

            {/* Lista de causas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.result.causas.map((causa, i) => (
                <CausaCard key={i} causa={causa} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function CausaCard({ causa }: { causa: Causa }) {
  const isActiva = /activ|tramit|vigent/i.test(causa.estado)
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--judicial-dark)' }}>{causa.rit}</span>
          <span className={`badge ${isActiva ? 'badge-activa' : 'badge-archivada'}`} style={{ marginLeft: 8 }}>
            {causa.estado || 'Sin estado'}
          </span>
        </div>
        {causa.urlDetalle && (
          <a href={causa.urlDetalle} target="_blank" rel="noopener noreferrer"
             style={{ fontSize: 12, color: 'var(--judicial-blue)', textDecoration: 'none', flexShrink: 0, fontWeight: 600 }}>
            Ver expediente ↗
          </a>
        )}
      </div>
      {causa.caratulado && (
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{causa.caratulado}</div>
      )}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {causa.tribunal && (
          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>⚖️ {causa.tribunal}</span>
        )}
        {causa.fechaUltimaActuacion && (
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>📅 Última actuación: {causa.fechaUltimaActuacion}</span>
        )}
        <span className="badge badge-blue">{causa.competencia}</span>
      </div>
    </div>
  )
}
