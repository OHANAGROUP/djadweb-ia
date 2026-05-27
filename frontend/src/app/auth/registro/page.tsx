'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function RegistroForm() {
  const [form, setForm] = useState({ nombreCompleto: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const supabase = createClient()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.nombreCompleto },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setError('Este email ya está registrado. Inicia sesión.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--brand-bg)' }}>
        <div className="card" style={{ width: '100%', maxWidth: 400, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Revisa tu correo</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.7 }}>
            Te enviamos un enlace de confirmación a <strong>{form.email}</strong>.
            Haz click en el enlace para activar tu cuenta.
          </p>
          <Link href="/auth/login" className="btn btn-ghost" style={{ marginTop: 24 }}>
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--brand-bg)' }}>
      <Link href="/" style={{ marginBottom: 32, display: 'block' }}>
        <img src="/Tramita_logo_final.png" alt="Tramita" style={{ height: 42, width: 'auto', display: 'block' }} />
      </Link>

      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '40px 36px' }}>
        <h1 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Crear cuenta gratis</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: plan ? 16 : 28 }}>
          Sin tarjeta de crédito · 3 consultas gratis al mes
        </p>

        {plan && (
          <div style={{ background: 'var(--judicial-light)', border: '1px solid var(--judicial-border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--judicial-dark)', marginBottom: 20, fontWeight: 600 }}>
            🎯 Después de registrarte podrás activar el plan <strong style={{ textTransform: 'capitalize' }}>{plan}</strong>.
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--red-light)', border: '1px solid #f5c6c6', color: 'var(--red)', borderRadius: 10, padding: '12px 14px', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="form-label">Nombre completo</label>
            <input
              className="form-input"
              name="nombreCompleto"
              type="text"
              value={form.nombreCompleto}
              onChange={handleChange}
              placeholder="Juan González"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label className="form-label">Correo electrónico</label>
            <input
              className="form-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@correo.cl"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creando cuenta...</> : 'Crear cuenta gratis →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-500)', marginTop: 24 }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" style={{ color: 'var(--brand-black)', fontWeight: 700, textDecoration: 'none' }}>
            Iniciar sesión
          </Link>
        </p>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--gray-400)', marginTop: 16, lineHeight: 1.5 }}>
          Al registrarte aceptas nuestros{' '}
          <a href="/terminos" style={{ color: 'inherit', textDecoration: 'underline' }}>Términos de Servicio</a>{' '}
          y{' '}
          <a href="/privacidad" style={{ color: 'inherit', textDecoration: 'underline' }}>Política de Privacidad</a>.
        </p>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>
            <span>🔒 HTTPS / TLS</span>
            <span>•</span>
            <span>📋 Ley 19.628</span>
          </div>
          <p style={{ fontSize: 10, color: 'var(--gray-400)', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
            Tus datos están protegidos y encriptados extremo a extremo.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--brand-bg)' }} />}>
      <RegistroForm />
    </Suspense>
  )
}
