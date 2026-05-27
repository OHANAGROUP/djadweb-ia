'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Perfil state
  const [perfil, setPerfil] = useState('persona')
  const [savingPerfil, setSavingPerfil] = useState(false)
  
  // SII config state
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/auth/login?redirect=/onboarding')
      } else {
        setUserId(user.id)
        setLoading(false)
      }
    })
  }, [router, supabase])

  async function handleSavePerfil(e: React.FormEvent) {
    e.preventDefault()
    setSavingPerfil(true)
    // Aquí se podría guardar el perfil en user_metadata o una tabla profiles
    await new Promise(r => setTimeout(r, 600)) // Simulación
    setSavingPerfil(false)
    setStep(2)
  }

  async function handleSaveSII(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    
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
        body: JSON.stringify({ provider: 'sii', username: rut, password: formPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al conectar SII.')
      
      setStep(3)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-bg)' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-bg)', color: 'var(--brand-text)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header simple */}
      <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>T</div>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>Tramita</span>
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, paddingBottom: 60, paddingLeft: 20, paddingRight: 20 }}>
        
        {/* Progress Tracker */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40, width: '100%', maxWidth: 460 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ 
              flex: 1, 
              height: 4, 
              borderRadius: 2, 
              background: i <= step ? '#2563EB' : 'var(--gray-200)',
              transition: 'background 0.3s ease'
            }} />
          ))}
        </div>

        <div className="card" style={{ width: '100%', maxWidth: 460, padding: '40px', borderRadius: 16 }}>
          
          {/* ── PASO 1: PERFIL ── */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Bienvenido a Tramita 👋</h1>
              <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
                Para personalizar tu experiencia, cuéntanos cómo usarás la plataforma.
              </p>
              
              <form onSubmit={handleSavePerfil} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label 
                    style={{ display: 'flex', gap: 14, padding: 16, border: perfil === 'persona' ? '2px solid #2563EB' : '1px solid var(--gray-200)', borderRadius: 10, cursor: 'pointer', alignItems: 'center', background: perfil === 'persona' ? 'rgba(37,99,235,0.04)' : '#fff' }}
                    onClick={() => setPerfil('persona')}
                  >
                    <input type="radio" checked={perfil === 'persona'} readOnly style={{ accentColor: '#2563EB', transform: 'scale(1.2)' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Persona Natural</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>Consultas de mi propio RUT</div>
                    </div>
                  </label>
                  
                  <label 
                    style={{ display: 'flex', gap: 14, padding: 16, border: perfil === 'empresa' ? '2px solid #2563EB' : '1px solid var(--gray-200)', borderRadius: 10, cursor: 'pointer', alignItems: 'center', background: perfil === 'empresa' ? 'rgba(37,99,235,0.04)' : '#fff' }}
                    onClick={() => setPerfil('empresa')}
                  >
                    <input type="radio" checked={perfil === 'empresa'} readOnly style={{ accentColor: '#2563EB', transform: 'scale(1.2)' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Mi Empresa / PYME</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>Gestiono el cumplimiento de mi negocio</div>
                    </div>
                  </label>

                  <label 
                    style={{ display: 'flex', gap: 14, padding: 16, border: perfil === 'contador' ? '2px solid #2563EB' : '1px solid var(--gray-200)', borderRadius: 10, cursor: 'pointer', alignItems: 'center', background: perfil === 'contador' ? 'rgba(37,99,235,0.04)' : '#fff' }}
                    onClick={() => setPerfil('contador')}
                  >
                    <input type="radio" checked={perfil === 'contador'} readOnly style={{ accentColor: '#2563EB', transform: 'scale(1.2)' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Contador / Estudio</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>Administro carteras de clientes</div>
                    </div>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 0', fontSize: 15 }} disabled={savingPerfil}>
                  {savingPerfil ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Guardando...</> : 'Continuar →'}
                </button>
              </form>
            </div>
          )}

          {/* ── PASO 2: CONECTAR SII ── */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🧾</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Conectar con el SII</h1>
              <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Tramita utiliza tus credenciales de forma segura para monitorear tu estado tributario, notificar vencimientos y verificar deudas.
              </p>
              
              {formError && (
                <div style={{ background: 'var(--red-light)', border: '1px solid #f5c6c6', color: 'var(--red)', borderRadius: 8, padding: '12px 14px', fontSize: 13, marginBottom: 20 }}>
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleSaveSII} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13 }}>RUT Asociado</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="12345678-9"
                    value={formUsername}
                    onChange={e => { setFormUsername(e.target.value); setFormError('') }}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 13 }}>Clave Tributaria SII</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Tu clave del SII"
                    value={formPassword}
                    onChange={e => { setFormPassword(e.target.value); setFormError('') }}
                    autoComplete="new-password"
                    required
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <span style={{ fontSize: 12 }}>🔐</span>
                    <span style={{ fontSize: 11.5, color: '#16A34A', fontWeight: 600 }}>Cifrado seguro AES-256-GCM.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button 
                    type="button" 
                    onClick={() => setStep(3)} 
                    style={{ flex: 1, padding: '12px 0', fontSize: 14, background: 'transparent', border: '1px solid var(--gray-200)', borderRadius: 8, color: 'var(--gray-500)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Omitir por ahora
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 2, padding: '12px 0', fontSize: 14 }} 
                    disabled={formLoading}
                  >
                    {formLoading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Conectando...</> : 'Conectar y asegurar →'}
                  </button>
                </div>
              </form>
              
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--gray-100)', fontSize: 11, color: 'var(--gray-400)', lineHeight: 1.5 }}>
                Tus credenciales nunca se almacenan en texto plano y no pueden ser leídas por nuestro personal. Cumplimos estrictamente la Ley 19.628 de Protección de Datos.
              </div>
            </div>
          )}

          {/* ── PASO 3: FINALIZAR ── */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.4s ease', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>¡Todo listo!</h1>
              <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
                Tu cuenta está configurada. Ya puedes comenzar a monitorear tu estado tributario y judicial desde el panel principal.
              </p>
              
              <button 
                onClick={() => router.push('/dashboard')}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px 0', fontSize: 15 }}
              >
                Ir a mi Panel Central →
              </button>
            </div>
          )}

        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}
