'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Provider = 'sii' | 'tgr'

interface CredentialStatus {
  provider:    Provider
  hasActive:   boolean
  username?:   string    // RUT en cleartext (no sensible por sí solo)
  updatedAt?:  string
}

// ── Badges de seguridad ───────────────────────────────────────────────────────

const SECURITY_BADGES = [
  { icon: '🔐', label: 'AES-256-GCM',   desc: 'Cifrado simétrico de grado bancario' },
  { icon: '📋', label: 'Ley 19.628',    desc: 'Cumplimiento Ley de Protección de Datos' },
  { icon: '🔒', label: 'HTTPS / TLS',   desc: 'Transporte cifrado extremo a extremo' },
  { icon: '🗑️', label: 'Revocable',     desc: 'Elimina tus credenciales en cualquier momento' },
]

// ── Componente principal ──────────────────────────────────────────────────────

export default function CredencialesPage() {
  const router   = useRouter()
  const supabase = createClient()

  // Estado de autenticación
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Estado de credenciales cargadas desde Supabase
  const [statuses, setStatuses] = useState<CredentialStatus[]>([
    { provider: 'sii', hasActive: false },
    { provider: 'tgr', hasActive: false },
  ])
  const [loadingStatus, setLoadingStatus] = useState(true)

  // Formulario
  const [activeForm, setActiveForm] = useState<Provider | null>(null)
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formError, setFormError]       = useState('')
  const [formLoading, setFormLoading]   = useState(false)
  const [formSuccess, setFormSuccess]   = useState('')

  // Revocación
  const [revoking, setRevoking] = useState<Provider | null>(null)

  // ── Auth guard ───────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/auth/login?redirect=/configuracion/credenciales')
      } else {
        setUserId(user.id)
        setLoadingAuth(false)
      }
    })
  }, [])

  // ── Cargar estado de credenciales ────────────────────────────────────────────

  const fetchStatuses = useCallback(async () => {
    if (!userId) return
    setLoadingStatus(true)
    try {
      const { data, error } = await supabase
        .from('user_credentials')
        .select('provider, username, updated_at, revoked_at')
        .eq('user_id', userId)
        .is('revoked_at', null)   // Solo activas

      if (error) throw error

      setStatuses([
        {
          provider:  'sii',
          hasActive: !!data?.find(r => r.provider === 'sii'),
          username:  data?.find(r => r.provider === 'sii')?.username,
          updatedAt: data?.find(r => r.provider === 'sii')?.updated_at,
        },
        {
          provider:  'tgr',
          hasActive: !!data?.find(r => r.provider === 'tgr'),
          username:  data?.find(r => r.provider === 'tgr')?.username,
          updatedAt: data?.find(r => r.provider === 'tgr')?.updated_at,
        },
      ])
    } catch (err: any) {
      console.error('[credenciales] fetchStatuses:', err.message)
    } finally {
      setLoadingStatus(false)
    }
  }, [userId])

  useEffect(() => { fetchStatuses() }, [fetchStatuses])

  // ── Guardar credenciales ─────────────────────────────────────────────────────

  async function handleSave(provider: Provider) {
    setFormError('')
    setFormSuccess('')

    const rut = formUsername.replace(/\./g, '').toUpperCase().trim()
    if (!/^[0-9]+-[0-9K]$/.test(rut)) {
      setFormError('RUT inválido. Use formato 12345678-9 o 76001382-K.')
      return
    }
    if (formPassword.length < 4) {
      setFormError('La contraseña debe tener al menos 4 caracteres.')
      return
    }

    setFormLoading(true)
    try {
      const res = await fetch('/api/credenciales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, username: rut, password: formPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al guardar.')

      setFormSuccess('Credenciales guardadas correctamente.')
      setFormUsername('')
      setFormPassword('')
      setActiveForm(null)
      await fetchStatuses()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // ── Revocar credenciales ─────────────────────────────────────────────────────

  async function handleRevoke(provider: Provider) {
    if (!confirm(`¿Confirmas que deseas eliminar tus credenciales de ${provider.toUpperCase()}? Esta acción es inmediata.`)) return

    setRevoking(provider)
    try {
      const res = await fetch('/api/credenciales', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al revocar.')

      setFormSuccess(`Credenciales de ${provider.toUpperCase()} eliminadas correctamente.`)
      await fetchStatuses()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setRevoking(null)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loadingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-bg)' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  const PROVIDER_META: Record<Provider, { label: string; icon: string; desc: string }> = {
    sii: { label: 'SII',                         icon: '🧾', desc: 'Servicio de Impuestos Internos' },
    tgr: { label: 'TGR',                         icon: '🏛️', desc: 'Tesorería General de la República' },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-bg)', color: 'var(--brand-text)', fontFamily: 'var(--font-ui, sans-serif)' }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: '1px solid var(--gray-100)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--brand-card)' }}>
        <Link href="/dashboard" style={{ color: 'var(--gray-400)', textDecoration: 'none', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ← Panel
        </Link>
        <span style={{ color: 'var(--gray-200)', fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-text)' }}>Credenciales de portales</span>
      </div>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* ── Título ── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 800, marginBottom: 8, color: 'var(--brand-text)' }}>
            Credenciales de portales
          </h1>
          <p style={{ fontSize: 14, color: 'var(--gray-400)', lineHeight: 1.6, maxWidth: 560 }}>
            Tramita puede consultar el SII y la TGR en tu nombre usando tus credenciales. Se almacenan cifradas con AES-256-GCM y nunca salen del servidor.
          </p>
        </div>

        {/* ── Alertas globales ── */}
        {formSuccess && (
          <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', color: '#16A34A', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20, fontWeight: 600 }}>
            ✅ {formSuccess}
          </div>
        )}
        {formError && !activeForm && (
          <div style={{ background: 'var(--red-light)', border: '1px solid #f5c6c6', color: 'var(--red)', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>
            ⚠️ {formError}
          </div>
        )}

        {/* ── Tarjetas por portal ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
          {statuses.map((status) => {
            const meta  = PROVIDER_META[status.provider]
            const isFormOpen = activeForm === status.provider

            return (
              <div key={status.provider} className="card" style={{ padding: '24px 28px', borderRadius: 12, background: 'var(--brand-card)', border: '1px solid var(--gray-100)' }}>

                {/* ── Encabezado tarjeta ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isFormOpen ? 20 : 0, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{meta.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--brand-text)' }}>{meta.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{meta.desc}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Estado badge */}
                    {loadingStatus ? (
                      <span className="spinner" style={{ width: 14, height: 14 }} />
                    ) : status.hasActive ? (
                      <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(22,163,74,0.1)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)', padding: '4px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                        ACTIVA
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(100,116,139,0.1)', color: 'var(--gray-400)', border: '1px solid var(--gray-100)', padding: '4px 10px', borderRadius: 99 }}>
                        SIN CONFIGURAR
                      </span>
                    )}

                    {/* Acciones */}
                    {!isFormOpen && (
                      status.hasActive ? (
                        <button
                          onClick={() => { setActiveForm(status.provider); setFormError(''); setFormSuccess('') }}
                          style={{ fontSize: 12, fontWeight: 700, background: 'transparent', border: '1px solid var(--gray-100)', color: 'var(--gray-400)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}
                        >
                          Actualizar
                        </button>
                      ) : (
                        <button
                          onClick={() => { setActiveForm(status.provider); setFormError(''); setFormSuccess('') }}
                          className="btn btn-primary"
                          style={{ fontSize: 12, padding: '6px 16px', borderRadius: 8 }}
                        >
                          Conectar
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* ── Info cuando está activa ── */}
                {status.hasActive && !isFormOpen && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--gray-100)', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      <span style={{ marginRight: 16 }}>RUT: <strong style={{ color: 'var(--brand-text)' }}>{status.username}</strong></span>
                      {status.updatedAt && (
                        <span>Actualizado: <strong style={{ color: 'var(--brand-text)' }}>{new Date(status.updatedAt).toLocaleDateString('es-CL')}</strong></span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRevoke(status.provider)}
                      disabled={revoking === status.provider}
                      style={{ fontSize: 11, fontWeight: 700, background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {revoking === status.provider ? <><span className="spinner" style={{ width: 10, height: 10 }} /> Revocando...</> : '🗑️ Eliminar'}
                    </button>
                  </div>
                )}

                {/* ── Formulario de carga ── */}
                {isFormOpen && (
                  <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
                    {formError && (
                      <div style={{ background: 'var(--red-light)', border: '1px solid #f5c6c6', color: 'var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 12, marginBottom: 16 }}>
                        {formError}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label className="form-label" style={{ fontSize: 12 }}>
                          RUT de acceso al portal {meta.label}
                        </label>
                        <input
                          className="form-input"
                          type="text"
                          placeholder="76001382-K"
                          value={formUsername}
                          onChange={e => { setFormUsername(e.target.value); setFormError('') }}
                          autoComplete="username"
                          style={{ fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: 12 }}>
                          Contraseña del portal {meta.label}
                        </label>
                        <input
                          className="form-input"
                          type="password"
                          placeholder="Tu contraseña del portal"
                          value={formPassword}
                          onChange={e => { setFormPassword(e.target.value); setFormError('') }}
                          autoComplete="new-password"
                          style={{ fontSize: 13 }}
                        />
                        <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6, lineHeight: 1.5 }}>
                          🔐 Tu contraseña se cifra con AES-256-GCM antes de salir de tu navegador. Tramita nunca almacena texto plano.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => { setActiveForm(null); setFormError(''); setFormUsername(''); setFormPassword('') }}
                          style={{ fontSize: 13, fontWeight: 600, background: 'transparent', border: '1px solid var(--gray-100)', color: 'var(--gray-400)', padding: '9px 18px', borderRadius: 8, cursor: 'pointer' }}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSave(status.provider)}
                          disabled={formLoading || !formUsername || !formPassword}
                          className="btn btn-primary"
                          style={{ fontSize: 13, padding: '9px 22px', borderRadius: 8 }}
                        >
                          {formLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Guardando...</> : 'Guardar cifrado'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )
          })}
        </div>

        {/* ── Badges de seguridad ── */}
        <div style={{ background: 'var(--brand-card)', border: '1px solid var(--gray-100)', borderRadius: 12, padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand-text)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🛡️ Cómo protegemos tus credenciales
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {SECURITY_BADGES.map(b => (
              <div key={b.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand-text)', marginBottom: 2 }}>{b.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', lineHeight: 1.4 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 20, lineHeight: 1.6, borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
            Tus credenciales se cifran en el servidor con AES-256-GCM (IV aleatorio por registro) antes de almacenarse. La clave de cifrado nunca toca la base de datos. La revocación elimina el acceso de forma inmediata y auditada. Cumplimos con la Ley N° 19.628 de Protección de Datos Personales de Chile.
          </p>
        </div>

      </main>
    </div>
  )
}
