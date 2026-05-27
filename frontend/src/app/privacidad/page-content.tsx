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
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Política de Privacidad</h1>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>Última actualización: 26 de mayo de 2026</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 32, marginBottom: 12 }}>1. Datos que recopilamos</h2>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>Recopilamos únicamente los datos necesarios para realizar consultas en portales del Estado chileno: RUT, nombres, y datos de contacto (email/Email) si eliges recibir alertas. No almacenamos claves ni credenciales de acceso a servicios públicos.</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 32, marginBottom: 12 }}>2. Uso de la información</h2>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>Tus datos se utilizan exclusivamente para procesar las consultas que solicitas en los portales del Estado (PJUD, SII, TGR, etc.), enviarte alertas sobre cambios de estado, y mejorar nuestro servicio. No compartimos tus datos con terceros sin tu consentimiento explícito.</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 32, marginBottom: 12 }}>3. Almacenamiento y seguridad</h2>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>Tus datos se almacenan de forma segura en servidores con cifrado en reposo y en tránsito. Puedes solicitar la eliminación de tus datos en cualquier momento escribiendo a hola@tramitai.cl.</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 32, marginBottom: 12 }}>4. Tus derechos</h2>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginBottom: 16 }}>De acuerdo a la Ley N°19.628 sobre Protección de Datos Personales, tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos personales. Para ejercer estos derechos, contáctanos en hola@tramitai.cl.</p>
        </div>
      </div>
    </div>
  )
}
