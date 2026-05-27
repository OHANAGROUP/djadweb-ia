'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push(redirect)
      router.refresh()
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--brand-bg)' }}>
      {/* Logo */}
      <Link href="/" style={{ marginBottom: 32, display: 'block' }}>
        <img src="/djadwebia_logo_final.png" alt="DEJAWEBIAR®" style={{ height: 42, width: 'auto', display: 'block' }} />
      </Link>

      <div className="card" style={{ width: '100%', maxWidth: 400, padding: '40px 36px' }}>
        <h1 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Iniciar sesión</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 28 }}>Accede a tu cuenta</p>

        {error && (
          <div style={{ background: 'var(--red-light)', border: '1px solid #f5c6c6', color: 'var(--red)', borderRadius: 10, padding: '12px 14px', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="form-label">Correo electrónico</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.cl"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Contraseña</label>
              <a href="#" style={{ fontSize: 12, color: 'var(--judicial-blue)', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</a>
            </div>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Entrando...</> : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-500)', marginTop: 24 }}>
          ¿No tienes cuenta?{' '}
          <Link href="/auth/registro" style={{ color: 'var(--brand-black)', fontWeight: 700, textDecoration: 'none' }}>
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-bg)' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
