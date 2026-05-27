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
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Tramita</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Términos de Servicio</h1>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>Última actualización: 26 de mayo de 2026</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 32, marginBottom: 12 }}>1. Aceptación de términos</h2>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>Al usar Tramita, aceptas estos Términos de Servicio. Si no estás de acuerdo, no utilices el servicio.</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 32, marginBottom: 12 }}>2. Descripción del servicio</h2>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>Tramita es un asistente que facilita consultas en portales del Estado chileno (PJUD, SII, TGR, Registro Civil, CMF, Extranjería). Actuamos como intermediario técnico; la información proviene de fuentes oficiales y no garantizamos su exactitud absoluta.</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 32, marginBottom: 12 }}>3. Responsabilidades del usuario</h2>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>Eres responsable de: (a) proporcionar información veraz, (b) no usar el servicio para actividades ilícitas, (c) mantener la confidencialidad de tus credenciales, y (d) no abusar del sistema con consultas automatizadas excesivas.</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 32, marginBottom: 12 }}>4. Limitación de responsabilidad</h2>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>Tramita no se hace responsable por: errores en portales oficiales, demoras en la actualización de datos, decisiones tomadas en base a la información consultada, o interrupciones del servicio por mantenimiento o causas externas.</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 32, marginBottom: 12 }}>5. Planes y facturación</h2>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>Ofrecemos planes Gratuito, Básico ($14.990/mes) y Contadores ($39.990/mes). Las suscripciones se renuevan automáticamente. Puedes cancelar en cualquier momento desde tu panel de control.</p>
        </div>
      </div>
    </div>
  )
}
