"use client"
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

const faqs = [
  {
    q: "¿Qué es Tramita?",
    a: "Tramita es un asistente de inteligencia artificial que unifica consultas a portales del Estado chileno (PJUD, SII, TGR, CMF, etc.) en un solo lugar. Ya no necesitas tener mil claves ni perder horas navegando entre sitios: pregúntanos lo que necesitas saber y nosotros lo buscamos por ti."
  },
  {
    q: "¿Necesito ClaveÚnica para usar Tramita?",
    a: "No. Puedes comenzar a consultar solo con tu RUT o nombre. Para ciertos trámites sensibles (como causas judiciales con acceso restringido) puede que necesites ClaveÚnica, pero la mayoría de las consultas funcionan sin ella."
  },
  {
    q: "¿Qué trámites puedo consultar?",
    a: "Actualmente soportamos consultas a PJUD (causas judiciales), SII (RUT, deudas, multas) y TGR (pagos). Estamos integrando Registro Civil (cédulas, nacimientos, matrimonios), CMF (morosidades financieras) y Extranjería (situación migratoria)."
  },
  {
    q: "¿La información es actualizada?",
    a: "Sí. Cada consulta se realiza en tiempo real contra los servidores oficiales del organismo correspondiente. No trabajamos con datos cacheados ni desactualizados."
  },
  {
    q: "¿Es seguro?",
    a: "Sí. Todas las consultas se realizan sobre conexiones cifradas. No almacenamos información sensible ni compartimos tus datos con terceros. Puedes revisar nuestra Política de Privacidad para más detalles."
  },
  {
    q: "¿Puedo probarlo gratis?",
    a: "Sí. El plan Gratuito te permite realizar consultas ilimitadas con resultados básicos. Si necesitas alertas por Email, historial completo o reportes avanzados, puedes suscribirte al plan Básico ($3.990/mes) o Premium ($7.990/mes)."
  },
  {
    q: "¿Cómo me llegan las alertas?",
    a: "Las alertas se envían por Email o email, según tu preferencia. Puedes configurar notificaciones para cambios en causas judiciales, vencimientos de deudas, actualizaciones SII, y más."
  },
  {
    q: "¿Puedo cancelar mi suscripción en cualquier momento?",
    a: "Sí. Puedes cancelar cuando quieras desde tu panel de usuario. No hay contratos de permanencia ni multas por cancelación anticipada."
  },
  {
    q: "¿Ofrecen soporte?",
    a: "Sí. Puedes contactarnos por email a hola@tramitai.cl o a través de nuestro Email. Respondemos en un plazo máximo de 24 horas hábiles."
  }
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details style={{ borderBottom: '1px solid var(--gray-100)', padding: '20px 0' }}>
      <summary style={{ cursor: 'pointer', color: '#fff', fontWeight: 600, fontSize: 16, listStyle: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {question}
          <span style={{ color: 'var(--accent)', fontSize: 20 }}>+</span>
        </div>
      </summary>
      <p style={{ color: 'var(--gray-400)', lineHeight: 1.8, marginTop: 16, fontSize: 14 }}>{answer}</p>
    </details>
  )
}

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
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 32 }}>Preguntas Frecuentes</h1>
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </div>
  )
}
