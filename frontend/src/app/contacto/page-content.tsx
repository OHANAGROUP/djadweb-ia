"use client"
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export default function PageContent() {
  const router = useRouter()
  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && document.referrer && document.referrer.startsWith(window.location.origin)) {
      router.back()
    } else {
      router.push('/')
    }
  }, [router])
  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-bg)' }}>
      <div className="container" style={{ paddingTop: 120, paddingBottom: 60, maxWidth: 720 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Volver
        </button>
        <div style={{ background: 'var(--brand-card)', borderRadius: 16, padding: '40px 48px', border: '1px solid var(--gray-100)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Tramita®</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Contacto</h1>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 24 }}>¿Tienes dudas, sugerencias o necesitas ayuda? Escríbenos y te responderemos a la brevedad.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: 24 }}>📧</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>Email</div>
                <a href="mailto:hola@tramitai.cl" style={{ color: 'var(--accent)', textDecoration: 'none' }}>hola@tramitai.cl</a>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: 24 }}>📱</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>Email</div>
                <span style={{ color: 'var(--gray-400)' }}>+56 9 1234 5678</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: 24 }}>🏢</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>Dirección</div>
                <span style={{ color: 'var(--gray-400)' }}>Santiago, Región Metropolitana, Chile</span>
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginTop: 24, fontSize: 13 }}>Respondemos en un plazo máximo de 24 horas hábiles.</p>
        </div>
      </div>
    </div>
  )
}
