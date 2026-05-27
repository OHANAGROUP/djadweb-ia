'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface CausaDemo {
  rit: string
  tribunal: string
  caratulado?: string
  estado?: string
  urlDetalle?: string
}

export default function HomePage() {
  // Waitlist form states
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)

  // Demo search states
  const [searchForm, setSearchForm] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    competencia: 'civil',
    anio: '',
  })
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchHasRun, setSearchHasRun] = useState(false)
  const [searchResult, setSearchResult] = useState<{
    causas: CausaDemo[]
    total: number
    consultadoEn?: string
  } | null>(null)
  const [searchError, setSearchError] = useState('')

  // Conversational Simulator States
  const [conversationalTab, setConversationalTab] = useState<'copilot' | 'pjud'>('copilot')
  const [chatInputText, setChatInputText] = useState('')
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      sender: 'copilot',
      text: '¡Hola! Soy tu Copiloto Burocrático. 🧭 El Estado habla difícil, pero yo te traduzco y te guío paso a paso. ¿Qué necesitas resolver hoy?',
      isInitial: true
    }
  ])
  const [chatScenario, setChatScenario] = useState<'sii' | 'acteco' | 'pjud_legal' | 'custom' | null>(null)
  const [chatStep, setChatStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isTyping])

  const startScenario = (scenarioId: 'sii' | 'acteco' | 'pjud_legal' | 'custom', customText?: string) => {
    setConversationalTab('copilot')
    setChatScenario(scenarioId)
    setIsTyping(true)

    // Scroll to chatbot window
    const chatContainer = document.getElementById('chat-window-section')
    if (chatContainer) {
      chatContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    setTimeout(() => {
      setIsTyping(false)
      if (scenarioId === 'sii') {
        setChatStep(1)
        setChatMessages([
          {
            sender: 'user',
            text: 'Me rechazaron una guía de despacho en el SII'
          },
          {
            sender: 'copilot',
            text: 'Entiendo perfectamente. El rechazo de guías de despacho en el SII es muy común y causa bastante estrés. 📄 Para ayudarte a resolverlo, necesito saber: ¿Qué código de error te apareció en el portal del SII?',
            actions: [
              { label: '🔢 Error 203', onClick: () => advanceSIIFlow(2, '203') },
              { label: '🔢 Error 205', onClick: () => advanceSIIFlow(2, '205') },
              { label: '🤔 Otro / No sé', onClick: () => advanceSIIFlow(2, 'otro') }
            ]
          }
        ])
      } else if (scenarioId === 'acteco') {
        setChatStep(1)
        setChatMessages([
          {
            sender: 'user',
            text: 'Quiero iniciar actividades pero no sé qué ACTECO usar'
          },
          {
            sender: 'copilot',
            text: '¡Felicitaciones por emprender! 🚀 Encontrar los códigos de actividad económica (ACTECO) correctos evita multas y rechazos del SII. ¿A qué se dedicará principalmente tu negocio?',
            actions: [
              { label: '💻 Servicios de Software / TI', onClick: () => advanceActecoFlow(2, 'ti') },
              { label: '🛒 Tienda Online / E-commerce', onClick: () => advanceActecoFlow(2, 'ecommerce') },
              { label: '☕ Cafetería / Comida', onClick: () => advanceActecoFlow(2, 'comida') },
              { label: '🎨 Diseño / Consultoría', onClick: () => advanceActecoFlow(2, 'creativo') }
            ]
          }
        ])
      } else if (scenarioId === 'pjud_legal') {
        setChatStep(1)
        setChatMessages([
          {
            sender: 'user',
            text: 'No entiendo esta notificación del PJUD'
          },
          {
            sender: 'copilot',
            text: 'La burocracia judicial en Chile es intimidante y está llena de términos difíciles. ⚖️ ¿Cuál de estas frases o palabras técnicas aparece en la notificación que recibiste?',
            actions: [
              { label: '⚠️ Contestada en rebeldía', onClick: () => advanceJudicialFlow(2, 'rebeldia') },
              { label: '📌 Artículo 44', onClick: () => advanceJudicialFlow(2, 'art44') },
              { label: '⏳ Con citación', onClick: () => advanceJudicialFlow(2, 'citacion') },
              { label: '🔍 No ha lugar', onClick: () => advanceJudicialFlow(2, 'nohalugar') }
            ]
          }
        ])
      } else {
        // Custom scenario
        setChatStep(1)
        setChatMessages([
          {
            sender: 'user',
            text: customText || 'Tengo una consulta general'
          },
          {
            sender: 'copilot',
            text: `Entiendo que necesitas resolver: "${customText || 'Tengo una consulta general'}". Para guiarte con la precisión de un GPS burocrático, selecciona cuál de estas intenciones describe mejor tu caso:`,
            actions: [
              { label: '🚀 Crear o formalizar mi negocio', onClick: () => startScenario('acteco') },
              { label: '📄 Emitir o corregir documento SII', onClick: () => startScenario('sii') },
              { label: '⚖️ Entender causas o notificaciones del PJUD', onClick: () => startScenario('pjud_legal') }
            ]
          }
        ])
      }
    }, 700)
  }

  const advanceSIIFlow = (step: number, choice: string) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      if (step === 2) {
        if (choice === '203') {
          setChatStep(2)
          setChatMessages(prev => [
            ...prev,
            { sender: 'user', text: 'Error 203' },
            {
              sender: 'copilot',
              text: 'El Error 203 corresponde a "Formato de patente vehicular inválido". 🚗 Para verificarlo en el Registro Nacional de Vehículos Motorizados, ¿la patente del vehículo transportista tiene el formato correcto (ej: AA-BB00 o AAA-B00)?',
              actions: [
                { label: '✅ Sí, formato correcto', onClick: () => advanceSIIFlow(3, 'formato_si') },
                { label: '❌ No estoy seguro', onClick: () => advanceSIIFlow(3, 'formato_no') },
                { label: '🤔 No tengo la patente', onClick: () => advanceSIIFlow(3, 'sin_patente') }
              ]
            }
          ])
        } else {
          setChatStep(2)
          setChatMessages(prev => [
            ...prev,
            { sender: 'user', text: choice === '205' ? 'Error 205' : 'Otro / No sé' },
            {
              sender: 'copilot',
              text: 'Para este tipo de inconsistencias en el SII, se suele requerir una auditoría de la declaración de IVA o de la factura origen. ¿Deseas que audite el documento o prefieres contactar con un experto?',
              actions: [
                { label: '🔍 Auditar documento ahora', onClick: () => alert('Auditoría simulada en proceso...') },
                { label: '👨💼 Hablar con un experto express', onClick: () => advanceSIIFlow(4, 'experto') }
              ]
            }
          ])
        }
      } else if (step === 3) {
        setChatStep(3)
        let choiceLabel = 'No estoy seguro'
        if (choice === 'formato_si') choiceLabel = 'Sí, formato correcto'
        if (choice === 'sin_patente') choiceLabel = 'No tengo la patente'

        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choiceLabel },
          {
            sender: 'copilot',
            text: '🔍 *Consultando bases de datos del Registro Civil y del Ministerio de Transportes en tiempo real...* (espera 2 segundos)'
          }
        ])

        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          setChatMessages(prev => {
            const temp = [...prev]
            // Remove the loading indicator text
            temp.pop()
            return [
              ...temp,
              {
                sender: 'copilot',
                text: <>
                  ❌ <strong>Resultado:</strong> La patente entregada <strong>\'AA-CD12\'</strong> no registra un vehículo comercial vigente en la base nacional.
                  <br /><br />
                  <strong>Causas más comunes:</strong>
                  <ul style={{ paddingLeft: 20, margin: '8px 0', listStyleType: 'disc' }}>
                    <li>Hay un dígito mal escrito (ej: falta una letra o número).</li>
                    <li>El vehículo fue dado de baja o no está a nombre del transportista.</li>
                    <li>El transportista te dio una patente antigua.</li>
                  </ul>
                  🛠️ <strong>¿Qué quieres hacer ahora?</strong>
                </>,
                actions: [
                  { label: '🔍 Validar otra patente', onClick: () => alert('Función Premium: Validador Automático del MTT activo') },
                  { label: '📱 WhatsApp de confirmación rápido', onClick: () => advanceSIIFlow(4, 'whatsapp') },
                  { label: '👨💼 Hablar con un experto express', onClick: () => advanceSIIFlow(4, 'experto') }
                ]
              }
            ]
          })
        }, 1500)
      } else if (step === 4) {
        if (choice === 'whatsapp') {
          setChatStep(4)
          setChatMessages(prev => [
            ...prev,
            { sender: 'user', text: '📱 WhatsApp de confirmación rápido' },
            {
              sender: 'copilot',
              text: <>
                ¡Excelente elección! He redactado un mensaje optimizado en base a la glosa del SII para que se lo envíes a tu transportista. Así obtendrás la patente correcta de inmediato sin rodeos burocráticos.
                <br /><br />
                <div style={{ background: 'var(--brand-white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 12, fontSize: 13, fontFamily: 'monospace', margin: '8px 0' }}>
                  "¡Hola! Me sale un error 203 en el SII con la patente del vehículo. ¿Me confirmas si está bien escrita como AA-CD12 o si tienes otra? ¡Gracias!"
                </div>
              </>,
              actions: [
                {
                  label: '📱 Abrir WhatsApp Web / App',
                  onClick: () => window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent('¡Hola! Me sale un error 203 en el SII con la patente del vehículo. ¿Me confirmas si está bien escrita como AA-CD12 o si tienes otra? ¡Gracias!'), '_blank'),
                  primary: true
                },
                { label: '🏠 Volver al inicio', onClick: () => resetChat() }
              ]
            }
          ])
        } else if (choice === 'experto') {
          setChatStep(4)
          setChatMessages(prev => [
            ...prev,
            { sender: 'user', text: '👨💼 Hablar con un experto express' },
            {
              sender: 'copilot',
              text: '¡Entendido! Te conectaremos de inmediato con un asesor experto en el SII del Hub de AutomatizAI para destrabar tu factura en 15 minutos.',
              actions: [
                { label: '📞 Agendar Asesoría Express (Sin Costo)', onClick: () => alert('Redireccionando a reserva de asesoría gratis...') },
                { label: '🏠 Volver al inicio', onClick: () => resetChat() }
              ]
            }
          ])
        }
      }
    }, 600)
  }

  const advanceActecoFlow = (step: number, choice: string) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      if (step === 2) {
        let choiceLabel = 'Venta de TI'
        if (choice === 'ecommerce') choiceLabel = 'Tienda Online / E-commerce'
        if (choice === 'comida') choiceLabel = 'Cafetería / Comida'
        if (choice === 'creativo') choiceLabel = 'Diseño / Consultoría'

        setChatStep(2)
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choiceLabel },
          {
            sender: 'copilot',
            text: 'Perfecto. El E-commerce en Chile está muy regulado por el SII. Para darte los códigos exactos, ¿pretendes importar mercadería o comprarás a proveedores locales?',
            actions: [
              { label: '🌍 Importar productos (China, etc.)', onClick: () => advanceActecoFlow(3, 'importar') },
              { label: '🇨🇱 Proveedores locales chilenos', onClick: () => advanceActecoFlow(3, 'local') },
              { label: '🔄 Ambos caminos', onClick: () => advanceActecoFlow(3, 'ambos') }
            ]
          }
        ])
      } else if (step === 3) {
        let choiceLabel = 'Importar productos'
        if (choice === 'local') choiceLabel = 'Proveedores chilenos'
        if (choice === 'ambos') choiceLabel = 'Ambos caminos'

        setChatStep(3)
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choiceLabel },
          {
            sender: 'copilot',
            text: '🔍 *Cruzando actividades económicas compatibles en el SII...*'
          }
        ])

        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          setChatMessages(prev => {
            const temp = [...prev]
            temp.pop() // Remove loading message
            return [
              ...temp,
              {
                sender: 'copilot',
                text: <>
                  ✅ <strong>Códigos ACTECO recomendados para tu E-commerce de Importación:</strong>
                  <br /><br />
                  <ul style={{ paddingLeft: 20, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <li>💼 <strong>479100</strong> - Venta al por menor por correo, por internet o por catálogo (Imprescindible para habilitar Transbank, Webpay o MercadoPago).</li>
                    <li>📦 <strong>469000</strong> - Venta al por mayor de otros productos (Te permite importar volúmenes sin trabas aduaneras).</li>
                    <li>🌍 <strong>464909</strong> - Venta al por mayor de otros enseres domésticos (Cubre la comercialización de accesorios generales).</li>
                  </ul>
                  <br />
                  💡 <strong>Consejo del Copiloto:</strong> Para activar estos códigos, necesitarás acreditar domicilio tributario. Puedes usar una de nuestras <strong>Oficinas Virtuales Partner</strong> si no posees local físico.
                </>,
                actions: [
                  {
                    label: '🚀 Iniciar Trámite de Formalización',
                    onClick: () => window.open('https://dejadwebiar-workflow.vercel.app', '_blank'),
                    primary: true
                  },
                  { label: '📞 Agendar Asesoría Express (Gratis)', onClick: () => alert('Redireccionando a reserva de asesoría gratis...') },
                  { label: '🏠 Volver al inicio', onClick: () => resetChat() }
                ]
              }
            ]
          })
        }, 1500)
      }
    }, 600)
  }

  const advanceJudicialFlow = (step: number, choice: string) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      if (step === 2) {
        let choiceLabel = 'Contestada en rebeldía'
        if (choice === 'art44') choiceLabel = 'Notificación Artículo 44'
        if (choice === 'citacion') choiceLabel = 'Con citación'
        if (choice === 'nohalugar') choiceLabel = 'No ha lugar'

        setChatStep(2)
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choiceLabel },
          {
            sender: 'copilot',
            text: '🔍 *Traduciendo jerga jurídica compleja...*'
          }
        ])

        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          setChatMessages(prev => {
            const temp = [...prev]
            temp.pop() // Remove loading message
            return [
              ...temp,
              {
                sender: 'copilot',
                text: <>
                  💡 <strong>Traducción Simple:</strong> "Se tiene por contestada la demanda en rebeldía" significa que <strong>el plazo para contestar venció y no te defendiste formalmente</strong>. El juicio continuará, pero el tribunal asume que niegas los hechos.
                  <br /><br />
                  🚨 <strong>¿Por qué es grave?</strong> Al no contestar formalmente a tiempo, perdiste la valiosa oportunidad de presentar tus argumentos iniciales, excepciones o contrademandas.
                  <br /><br />
                  🛠️ <strong>¿Qué debes hacer de inmediato?</strong>
                  <ul style={{ paddingLeft: 20, margin: '8px 0', listStyleType: 'disc' }}>
                    <li>Presentarte en el juicio patrocinado por un abogado habilitado a la brevedad.</li>
                    <li>Monitorear de inmediato las causas públicas asociadas a tu RUT para prever medidas como embargos.</li>
                  </ul>
                </>,
                actions: [
                  {
                    label: '🔍 Buscar causas asociadas gratis',
                    onClick: () => setConversationalTab('pjud'),
                    primary: true
                  },
                  { label: '👨💼 Hablar con Abogado Express', onClick: () => alert('Conectando con un abogado express...') },
                  { label: '🏠 Volver al inicio', onClick: () => resetChat() }
                ]
              }
            ]
          })
        }, 1500)
      }
    }, 600)
  }

  const resetChat = () => {
    setChatScenario(null)
    setChatStep(0)
    setChatInputText('')
    setChatMessages([
      {
        sender: 'copilot',
        text: '¡Hola! Soy tu Copiloto Burocrático. 🧭 El Estado habla difícil, pero yo te traduzco y te guío paso a paso. ¿Qué necesitas resolver hoy?',
        isInitial: true
      }
    ])
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInputText.trim()) return
    const text = chatInputText
    setChatInputText('')
    startScenario('custom', text)
  }

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setWaitlistSuccess(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearchForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchLoading(true)
    setSearchError('')
    setSearchHasRun(true)

    // Scroll slightly to let user see the results window
    const resultsElem = document.getElementById('results-window')
    if (resultsElem) {
      setTimeout(() => {
        resultsElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }

    try {
      const res = await fetch('/api/buscar-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: searchForm.nombre,
          apellidoPaterno: searchForm.apellidoPaterno,
          apellidoMaterno: searchForm.apellidoMaterno,
          competencia: searchForm.competencia,
          anio: searchForm.anio,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`)
      }

      setSearchResult({
        causas: data.causas || [],
        total: data.total || 0,
        consultadoEn: new Date().toISOString(),
      })
    } catch (err: any) {
      console.error(err)
      setSearchError(err.message || 'No se pudo conectar al servidor de búsqueda. Inténtalo de nuevo.')
    } finally {
      setSearchLoading(false)
    }
  }

  const capitalizar = (str: string) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
  }

  return (
    <>
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="hero" id="hero" style={{ padding: '88px 0 104px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Fondo decorativo */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(230,81,0,0.07) 0%, transparent 70%)' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: -60, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,81,0,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge-pill animate-slide-up">
            <span style={{ display: 'inline-block', width: 7, height: 7, background: 'var(--brand-orange)', borderRadius: '50%', animation: 'pulse-soft 2s ease infinite' }} />
            GPS Burocrático · Chile 2026
          </div>
          <h1 className="animate-slide-up delay-100" style={{ fontFamily: 'var(--font-ui)', fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', marginBottom: 24 }}>
            ¿Estresado con un trámite del Estado?
            <br />
            <span style={{ color: 'var(--brand-orange)', position: 'relative', display: 'inline-block' }}>
              Te guiamos paso a paso.
              <svg viewBox="0 0 320 12" style={{ position: 'absolute', bottom: -10, left: 0, width: '100%', height: 10, overflow: 'visible' }} aria-hidden>
                <path d="M2 8 C60 2, 140 12, 200 6 C250 2, 290 10, 318 6" stroke="var(--brand-orange)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.35"/>
              </svg>
            </span>
          </h1>
          <p className="animate-slide-up delay-200" style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--gray-500)', maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.75 }}>
            Sin lenguaje técnico. Sin vueltas. Sin ansiedad. Cuéntame qué necesitas resolver hoy y tu copiloto burocrático te entregará la solución.
          </p>

          {/* Conversational Entrypoint Form */}
          <form onSubmit={handleChatSubmit} className="animate-slide-up delay-300" style={{ display: 'flex', gap: 10, maxWidth: 620, margin: '0 auto 20px', flexWrap: 'wrap', background: '#fff', padding: 6, borderRadius: 'var(--radius-lg)', border: '2px solid var(--gray-200)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', transition: 'box-shadow 0.2s ease' }}>
            <input
              type="text"
              placeholder="💬 Ej: Me rechazaron una factura en el SII..."
              value={chatInputText}
              onChange={e => setChatInputText(e.target.value)}
              required
              style={{
                flex: 1, minWidth: 200, height: 48, border: 'none', borderRadius: 'var(--radius)',
                padding: '0 16px', fontSize: 15, fontFamily: 'inherit', outline: 'none', background: 'transparent'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ height: 48, background: 'var(--brand-black)', color: '#fff', padding: '0 24px', fontSize: 14 }}>
              🚀 Iniciar Copiloto
            </button>
          </form>

          {/* Quick Examples */}
          <div className="animate-fade-in delay-400" style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', maxWidth: 780, margin: '0 auto 40px' }}>
            {[
              { emoji: '📄', label: '"Me rechazaron una factura en el SII"', scenario: 'sii' as const },
              { emoji: '🚀', label: '"Quiero iniciar actividades (ACTECO)"',  scenario: 'acteco' as const },
              { emoji: '⚖️', label: '"No entiendo esta notificación del PJUD"', scenario: 'pjud_legal' as const },
            ].map(({ emoji, label, scenario }) => (
              <button
                key={scenario}
                onClick={() => startScenario(scenario)}
                style={{ background: '#fff', border: '1px solid var(--gray-200)', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gray-400)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                {emoji} {label}
              </button>
            ))}
          </div>

          {/* Portales strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', margin: '20px 0 32px' }}>
            {/* PJUD — activo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px solid var(--green-border)', borderRadius: 10, padding: '7px 14px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1b5e20', letterSpacing: '.01em' }}>Poder Judicial</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', background: 'var(--green-light)', padding: '2px 8px', borderRadius: 99 }}>Activo</span>
            </div>

            {/* SII */}
            <a
              href="https://dejadwebiar-workflow.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              title="Iniciar trámite de Cambio de Representante Legal"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: '#fff',
                border: '1.5px solid var(--green-border)',
                borderRadius: 10,
                padding: '7px 14px',
                textDecoration: 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 125, 50, 0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1b5e20', letterSpacing: '.01em' }}>SII (Rep. Legal)</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', background: 'var(--green-light)', padding: '2px 8px', borderRadius: 99 }}>Activo</span>
            </a>

            {/* TGR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px solid var(--gray-200)', borderRadius: 10, padding: '7px 14px', opacity: 0.65 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-600)' }}>Tesorería</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 99 }}>Próximo</span>
            </div>

            {/* Registro Civil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px solid var(--gray-200)', borderRadius: 10, padding: '7px 14px', opacity: 0.65 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-600)' }}>Reg. Civil</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 99 }}>Próximo</span>
            </div>
          </div>

          {/* Intent-First Quick Choices Grid */}
          <div className="animate-scale-in delay-500" style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '32px', boxShadow: '0 8px 40px rgba(10,10,14,0.07)', border: '1px solid rgba(10,10,14,0.05)', margin: '48px auto 0', maxWidth: 780, textAlign: 'left' }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gray-400)', marginBottom: 16 }}>¿Qué necesitas resolver hoy?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { emoji: '🚀', label: 'Iniciar o formalizar pyme',    scenario: 'acteco' as const },
                { emoji: '📄', label: 'Corregir rechazos del SII',     scenario: 'sii' as const },
                { emoji: '⚖️', label: 'Apelar notificaciones legales', scenario: 'pjud_legal' as const },
                { emoji: '🤔', label: 'Otro trámite... cuéntame',      scenario: 'custom' as const },
              ].map(({ emoji, label, scenario }) => (
                <button
                  key={scenario}
                  onClick={() => startScenario(scenario)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 14px', background: 'var(--brand-bg)', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: 13.5, fontWeight: 700, color: 'var(--gray-800)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gray-400)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,10,14,0.07)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'var(--brand-bg)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CENTRO DE RESOLUCIÓN CONVERSACIONAL (SIMULADOR & BUSCADOR) ─── */}
      <section className="demo-section" id="chat-window-section" style={{ background: 'var(--gray-100)', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)', padding: '72px 0' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, marginBottom: 10 }}>Centro de Resolución de Trámites</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>Experimenta la inteligencia de tu GPS Burocrático o consulta bases de datos directamente.</p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            <button
              onClick={() => setConversationalTab('copilot')}
              style={{
                padding: '10px 24px',
                borderRadius: 99,
                fontSize: 13.5,
                fontWeight: 800,
                cursor: 'pointer',
                border: 'none',
                background: conversationalTab === 'copilot' ? 'var(--brand-black)' : '#fff',
                color: conversationalTab === 'copilot' ? '#fff' : 'var(--gray-600)',
                boxShadow: 'var(--shadow)',
                transition: 'all 0.15s'
              }}
            >
              🧭 Copiloto Conversacional (Recomendado)
            </button>
            <button
              onClick={() => setConversationalTab('pjud')}
              style={{
                padding: '10px 24px',
                borderRadius: 99,
                fontSize: 13.5,
                fontWeight: 800,
                cursor: 'pointer',
                border: 'none',
                background: conversationalTab === 'pjud' ? 'var(--brand-black)' : '#fff',
                color: conversationalTab === 'pjud' ? '#fff' : 'var(--gray-600)',
                boxShadow: 'var(--shadow)',
                transition: 'all 0.15s'
              }}
            >
              🔍 Buscador Judicial Directo (PJUD)
            </button>
          </div>

          {conversationalTab === 'copilot' ? (
            /* 💬 COPILOTO CHATROOM WINDOW */
            <div className="browser-window" style={{ maxWidth: 720, margin: '0 auto', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', background: '#fff', boxShadow: '0 4px 32px rgba(0,0,0,.08)', overflow: 'hidden' }}>
              <div className="browser-bar" style={{ background: 'var(--gray-100)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--gray-200)' }}>
                <div className="dots" style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fc5c5c' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fdbc40' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#34c749' }} />
                </div>
                <div style={{ flex: 1, background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: 'var(--gray-700)', fontWeight: 600, marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--brand-orange)', fontSize: 10 }}>●</span> Copiloto Activo · Traduciendo Burocracia
                </div>
              </div>

              {/* Chat Content Body */}
              <div style={{ height: 380, overflowY: 'auto', padding: '24px 20px', background: '#FAF9F6', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {chatMessages.map((msg, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%',
                      padding: '14px 18px',
                      borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      background: msg.sender === 'user' ? 'var(--brand-orange)' : '#fff',
                      color: msg.sender === 'user' ? '#fff' : 'var(--gray-900)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--gray-200)',
                      fontSize: 13.5,
                      lineHeight: 1.6
                    }}>
                      {/* Text */}
                      <div>{msg.text}</div>

                      {/* Actions/Buttons inside the chat */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                          {msg.actions.map((act: any, aIdx: number) => (
                            <button
                              key={aIdx}
                              onClick={act.onClick}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 10,
                                border: act.primary ? 'none' : '1px solid var(--gray-300)',
                                background: act.primary ? 'var(--brand-black)' : 'var(--gray-50)',
                                color: act.primary ? '#fff' : 'var(--gray-800)',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.1s'
                              }}
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ background: '#fff', border: '1px solid var(--gray-200)', padding: '12px 18px', borderRadius: '18px 18px 18px 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="dot" style={{ width: 6, height: 6, background: 'var(--gray-400)', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s infinite alternate' }} />
                      <span className="dot" style={{ width: 6, height: 6, background: 'var(--gray-400)', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s infinite alternate', animationDelay: '0.2s' }} />
                      <span className="dot" style={{ width: 6, height: 6, background: 'var(--gray-400)', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s infinite alternate', animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--gray-200)', background: '#fff' }}>
                <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Escribe tu consulta o dilema burocrático..."
                    value={chatInputText}
                    onChange={e => setChatInputText(e.target.value)}
                    style={{
                      flex: 1,
                      height: 44,
                      border: '2px solid var(--gray-100)',
                      borderRadius: 'var(--radius)',
                      padding: '0 16px',
                      fontSize: 13.5,
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ background: 'var(--brand-black)', color: '#fff', height: 44, padding: '0 20px' }}>
                    Enviar
                  </button>
                  {chatScenario && (
                    <button type="button" onClick={resetChat} style={{ border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', background: 'transparent', height: 44, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Reiniciar chat">
                      🔄
                    </button>
                  )}
                </form>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>
                  <span>🔐 Tu ClaveÚnica nunca es requerida ni almacenada</span>
                  <span>👁️ Transparencia de datos</span>
                </div>
              </div>
            </div>
          ) : (
            /* 🔍 THE EXISTING RAW PJUD SEARCH FORM */
            <div className="browser-window" id="results-window" style={{ maxWidth: 720, margin: '0 auto', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', background: '#fff', boxShadow: '0 4px 32px rgba(0,0,0,.08)', overflow: 'hidden' }}>
              <div className="browser-bar" style={{ background: 'var(--gray-100)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--gray-200)' }}>
                <div className="dots" style={{ display: 'flex', gap: 6 }}>
                  <div className="dot red" style={{ width: 12, height: 12, borderRadius: '50%', background: '#fc5c5c' }} />
                  <div className="dot yellow" style={{ width: 12, height: 12, borderRadius: '50%', background: '#fdbc40' }} />
                  <div className="dot green" style={{ width: 12, height: 12, borderRadius: '50%', background: '#34c749' }} />
                </div>
                <div className="url-bar url-bar-live" style={{ flex: 1, background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: 'var(--gray-700)', fontWeight: 500, marginLeft: 8 }}>
                  {searchLoading
                    ? `oficinajudicialvirtual.pjud.cl — buscando ${searchForm.nombre} ${searchForm.apellidoPaterno}…`
                    : `Poder Judicial · ${searchForm.nombre} ${searchForm.apellidoPaterno} · ${capitalizar(searchForm.competencia)}`}
                </div>
              </div>
              <div className="browser-content" style={{ padding: 24 }}>
                {/* Search Form */}
                <form className="search-form" onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: searchHasRun ? 24 : 0 }}>
                  <div className="search-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div className="search-field" style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1.2, minWidth: 140 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>Nombre *</label>
                      <input
                        name="nombre"
                        type="text"
                        placeholder="Ej: Juan"
                        value={searchForm.nombre}
                        onChange={handleSearchChange}
                        required
                        autoComplete="off"
                        style={{ height: 44, border: '2px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '0 14px', fontSize: 14, fontFamily: 'inherit', fontWeight: 500, outline: 'none', background: '#fff', color: 'var(--negro)', transition: 'border-color .15s' }}
                      />
                    </div>
                    <div className="search-field" style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1.5, minWidth: 140 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>Apellido Paterno *</label>
                      <input
                        name="apellidoPaterno"
                        type="text"
                        placeholder="Ej: González"
                        value={searchForm.apellidoPaterno}
                        onChange={handleSearchChange}
                        required
                        autoComplete="off"
                        style={{ height: 44, border: '2px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '0 14px', fontSize: 14, fontFamily: 'inherit', fontWeight: 500, outline: 'none', background: '#fff', color: 'var(--negro)', transition: 'border-color .15s' }}
                      />
                    </div>
                    <div className="search-field" style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1.5, minWidth: 140 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>Apellido Materno</label>
                      <input
                        name="apellidoMaterno"
                        type="text"
                        placeholder="Opcional"
                        value={searchForm.apellidoMaterno}
                        onChange={handleSearchChange}
                        autoComplete="off"
                        style={{ height: 44, border: '2px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '0 14px', fontSize: 14, fontFamily: 'inherit', fontWeight: 500, outline: 'none', background: '#fff', color: 'var(--negro)', transition: 'border-color .15s' }}
                      />
                    </div>
                  </div>
                  <div className="search-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div className="search-field" style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 2, minWidth: 140 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>Competencia</label>
                      <select
                        name="competencia"
                        value={searchForm.competencia}
                        onChange={handleSearchChange}
                        style={{ height: 44, border: '2px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '0 14px', fontSize: 14, fontFamily: 'inherit', fontWeight: 500, outline: 'none', background: '#fff', color: 'var(--negro)', transition: 'border-color .15s' }}
                      >
                        <option value="civil">Civil</option>
                        <option value="laboral">Laboral</option>
                        <option value="familia">Familia</option>
                        <option value="penal">Penal</option>
                        <option value="cobranza">Cobranza</option>
                        <option value="suprema">Corte Suprema</option>
                        <option value="apelaciones">Corte de Apelaciones</option>
                      </select>
                    </div>
                    <div className="search-field" style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 100 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>Año (opcional)</label>
                      <input
                        name="anio"
                        type="text"
                        placeholder="Ej: 2023"
                        value={searchForm.anio}
                        onChange={handleSearchChange}
                        maxLength={4}
                        style={{ height: 44, border: '2px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '0 14px', fontSize: 14, fontFamily: 'inherit', fontWeight: 500, outline: 'none', background: '#fff', color: 'var(--negro)', transition: 'border-color .15s' }}
                      />
                    </div>
                  </div>
                  <div className="search-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="btn btn-primary"
                      style={{ padding: '13px 36px', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      {searchLoading ? (
                        <>
                          <span className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                          Buscando…
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                          Buscar causas
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Search Results Display */}
                {searchHasRun && (
                  <div style={{ marginTop: 20 }}>
                    {searchLoading ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin .9s linear infinite', marginBottom: 12, display: 'inline-block' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-600)' }}>Consultando el Poder Judicial…</div>
                        <div style={{ fontSize: 12, marginTop: 6 }}>Esto puede tomar hasta 30 segundos</div>
                      </div>
                    ) : searchError ? (
                      <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '16px 20px', color: '#be123c', fontSize: 14, textAlign: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                        {searchError}
                      </div>
                    ) : searchResult ? (
                      <div>
                        <div className="demo-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 600 }}>
                            Resultados para <strong>{searchForm.nombre} {searchForm.apellidoPaterno}</strong>
                          </h3>
                          {searchResult.consultadoEn && (
                            <span className="tag-green" style={{ background: 'var(--green-light)', color: 'var(--green)', border: '1px solid var(--green-border)', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                              Consultado {new Date(searchResult.consultadoEn).toLocaleTimeString('es-CL')}
                            </span>
                          )}
                        </div>
                        <div className="results-summary" style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                          <span className={`result-badge ${searchResult.total > 0 ? 'orange' : 'green'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: searchResult.total > 0 ? 'var(--orange-light)' : 'var(--green-light)', color: searchResult.total > 0 ? 'var(--brand-orange)' : 'var(--green)', border: '1px solid', borderColor: searchResult.total > 0 ? '#ffccbc' : 'var(--green-border)', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 700 }}>
                            {searchResult.total === 0 ? '✓' : '⚠'} {searchResult.total} causa{searchResult.total !== 1 ? 's' : ''} encontrada{searchResult.total !== 1 ? 's' : ''}
                          </span>
                          <span className="result-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px solid var(--gray-200)', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 700 }}>
                            {capitalizar(searchForm.competencia)}
                          </span>
                        </div>

                        {searchResult.total === 0 ? (
                          <div className="empty-box" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 10, padding: 32, textAlign: 'center', color: 'var(--gray-500)', fontSize: 14 }}>
                            <strong style={{ display: 'block', color: 'var(--gray-700)', fontSize: 15, marginBottom: 6 }}>Sin causas registradas</strong>
                            No se encontraron causas en el área <strong>{capitalizar(searchForm.competencia)}</strong> para este nombre.
                          </div>
                        ) : (
                          <>
                            <div className="causas-list" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                              {searchResult.causas.map((c, idx) => {
                                const isDone = /termin|resuel|archivo/i.test(c.estado || '')
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => c.urlDetalle && window.open(c.urlDetalle, '_blank')}
                                    title={c.urlDetalle ? 'Ver detalle en PJUD' : undefined}
                                    className="causa-row"
                                    style={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--gray-100)', borderRadius: 8, padding: '11px 16px', fontSize: 13, cursor: c.urlDetalle ? 'pointer' : 'default', transition: 'background .1s'
                                    }}
                                  >
                                    <div className="causa-left">
                                      <span className="causa-rit" style={{ fontFamily: 'SF Mono, Courier New, monospace', fontWeight: 600, color: 'var(--gray-800)' }}>{c.rit}</span>
                                      <span className="causa-sep" style={{ color: 'var(--gray-300)', margin: '0 8px' }}>·</span>
                                      <span className="causa-tribunal" style={{ fontSize: 12, color: 'var(--gray-500)' }}>{c.tribunal || c.caratulado}</span>
                                    </div>
                                    <div className="causa-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span className="tag-type" style={{ border: '1px solid var(--gray-300)', color: 'var(--gray-600)', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{capitalizar(searchForm.competencia)}</span>
                                      <span className={`causa-estado ${isDone ? 'done' : 'active'}`} style={{ fontSize: 12, fontWeight: 600, color: isDone ? 'var(--gray-400)' : 'var(--brand-orange)' }}>{c.estado || 'En tramitación'}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* IA Box */}
                            <div style={{ background: '#fff8f0', border: '1px solid #ffe0c0', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.6, marginTop: 12 }}>
                              🤖 <strong>Resumen IA (Plan Premium):</strong> Se detectaron causas activas para {searchForm.nombre} {searchForm.apellidoPaterno} en la competencia {searchForm.competencia}. Para obtener un desglose detallado con lenguaje simple redactado por Inteligencia Artificial y recibir alertas de nuevas actuaciones, actualiza tu cuenta.
                            </div>
                          </>
                        )}

                        <div style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'right', marginTop: 12 }}>
                          Fuente: Poder Judicial de Chile · Datos públicos
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section" id="como-funciona" style={{ padding: '96px 0' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 10, letterSpacing: '-.5px' }}>Tan fácil como buscar en Google</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>Sin claves especiales, sin navegar portales del gobierno. Solo tu nombre o RUT.</p>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            <div className="step" style={{ display: 'flex', gap: 16 }}>
              <div className="step-num" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gray-900)', color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>01</div>
              <div className="step-body">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Ingresa tu RUT o nombre</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.65 }}>No necesitas ClaveÚnica ni crear contraseñas complicadas para la consulta básica.</p>
              </div>
            </div>
            <div className="step" style={{ display: 'flex', gap: 16 }}>
              <div className="step-num" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gray-900)', color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>02</div>
              <div className="step-body">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Consultamos por ti</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.65 }}>Accedemos a los portales del Poder Judicial, SII y TGR en segundos y agregamos la información.</p>
              </div>
            </div>
            <div className="step" style={{ display: 'flex', gap: 16 }}>
              <div className="step-num" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gray-900)', color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>03</div>
              <div className="step-body">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Recibe tu resumen</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.65 }}>Te mostramos todo en un panel claro con lenguaje simple. Activa alertas para novedades futuras.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="section section-alt" style={{ padding: '96px 0', background: 'var(--gray-100)', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 10, letterSpacing: '-.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              Por qué <img src="/djadwebia_logo_final.png" alt="DEJAWEBIAR®" className="inline-logo-img" style={{ height: 'clamp(20px, 3vw, 30px)', width: 'auto', display: 'inline-block', verticalAlign: 'middle' }} />
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>El Estado tiene tu información. Nosotros te la entregamos en el formato que mereces.</p>
          </div>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            <div className="feature-card" style={{ border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 20, padding: '28px 24px', background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.04), 0 1px 3px rgba(10, 10, 14, 0.02)' }}>
              <div className="feature-icon" style={{ width: 42, height: 42, background: 'rgba(230, 81, 0, 0.08)', color: 'var(--brand-orange)', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 10 }}>Un solo lugar</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--gray-500)', lineHeight: 1.6 }}>Ingresa tu RUT y ve en segundos tus causas del Poder Judicial, deudas en SII y TGR, y más.</p>
            </div>
            <div className="feature-card" style={{ border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 20, padding: '28px 24px', background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.04), 0 1px 3px rgba(10, 10, 14, 0.02)' }}>
              <div className="feature-icon" style={{ width: 42, height: 42, background: 'rgba(230, 81, 0, 0.08)', color: 'var(--brand-orange)', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 10 }}>Alertas automáticas</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--gray-500)', lineHeight: 1.6 }}>Te avisamos por WhatsApp o email cuando aparece una nueva causa o cambia el estado de una existente.</p>
            </div>
            <div className="feature-card" style={{ border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 20, padding: '28px 24px', background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.04), 0 1px 3px rgba(10, 10, 14, 0.02)' }}>
              <div className="feature-icon" style={{ width: 42, height: 42, background: 'rgba(230, 81, 0, 0.08)', color: 'var(--brand-orange)', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 10 }}>Lenguaje simple</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--gray-500)', lineHeight: 1.6 }}>Nada de lenguaje jurídico incomprensible. Te explicamos qué significa cada resultado.</p>
            </div>
            <div className="feature-card" style={{ border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 20, padding: '28px 24px', background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.04), 0 1px 3px rgba(10, 10, 14, 0.02)' }}>
              <div className="feature-icon" style={{ width: 42, height: 42, background: 'rgba(230, 81, 0, 0.08)', color: 'var(--brand-orange)', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 10 }}>Privacidad garantizada</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--gray-500)', lineHeight: 1.6 }}>No almacenamos tus datos más de lo necesario. Cumplimos con la Ley 19.628 de protección de datos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PORTALES INTEGRADOS ─── */}
      <section className="section" id="fuentes" style={{ padding: '96px 0' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 10, letterSpacing: '-.5px' }}>Portales integrados</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Consultamos directamente los sistemas oficiales del Estado chileno.</p>
          </div>
          <div className="sources-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div className="source-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 16, padding: 20, background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.03)' }}>
              <div className="source-icon" style={{ width: 40, height: 40, background: 'var(--gray-900)', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>P</div>
              <div>
                <div className="source-name" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  Poder Judicial <span className="tag-available" style={{ background: 'var(--green-light)', color: 'var(--green)', border: '1px solid var(--green-border)', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Disponible</span>
                </div>
                <div className="source-desc" style={{ fontSize: '12.5px', color: 'var(--gray-500)' }}>Causas civiles, laborales, familia, penal</div>
              </div>
            </div>
            <div className="source-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 16, padding: 20, background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.03)' }}>
              <div className="source-icon" style={{ width: 40, height: 40, background: 'var(--gray-900)', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>S</div>
              <div>
                <div className="source-name" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  SII <span className="tag-available" style={{ background: 'var(--green-light)', color: 'var(--green)', border: '1px solid var(--green-border)', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Disponible</span>
                </div>
                <div className="source-desc" style={{ fontSize: '12.5px', color: 'var(--gray-500)' }}>Deudas tributarias y declaraciones</div>
              </div>
            </div>
            <div className="source-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 16, padding: 20, background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.03)' }}>
              <div className="source-icon" style={{ width: 40, height: 40, background: 'var(--gray-900)', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>T</div>
              <div>
                <div className="source-name" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  TGR <span className="tag-soon" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)', border: '1px solid var(--gray-200)', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Próximamente</span>
                </div>
                <div className="source-desc" style={{ fontSize: '12.5px', color: 'var(--gray-500)' }}>Deudas fiscales y contribuciones</div>
              </div>
            </div>
            <div className="source-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 16, padding: 20, background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.03)' }}>
              <div className="source-icon" style={{ width: 40, height: 40, background: 'var(--gray-900)', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>C</div>
              <div>
                <div className="source-name" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  CMF / DICOM <span className="tag-soon" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)', border: '1px solid var(--gray-200)', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Próximamente</span>
                </div>
                <div className="source-desc" style={{ fontSize: '12.5px', color: 'var(--gray-500)' }}>Historial crediticio y protestos</div>
              </div>
            </div>
            <div className="source-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 16, padding: 20, background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.03)' }}>
              <div className="source-icon" style={{ width: 40, height: 40, background: 'var(--gray-900)', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>R</div>
              <div>
                <div className="source-name" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  Registro Civil <span className="tag-soon" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)', border: '1px solid var(--gray-200)', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>2025</span>
                </div>
                <div className="source-desc" style={{ fontSize: '12.5px', color: 'var(--gray-500)' }}>Vigencia cédula y antecedentes</div>
              </div>
            </div>
            <div className="source-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 16, padding: 20, background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.03)' }}>
              <div className="source-icon" style={{ width: 40, height: 40, background: 'var(--gray-900)', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>E</div>
              <div>
                <div className="source-name" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  Extranjería <span className="tag-soon" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)', border: '1px solid var(--gray-200)', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>2025</span>
                </div>
                <div className="source-desc" style={{ fontSize: '12.5px', color: 'var(--gray-500)' }}>Estado trámites migratorios</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="testimonials-section" style={{ background: 'var(--gray-900)', padding: '96px 0' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, textAlign: 'center', marginBottom: 56 }}>Lo que dicen nuestros usuarios</h2>
          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div className="testimonial" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: 32 }}>
              <p className="testimonial-quote" style={{ color: 'rgba(255,255,255,.85)', fontSize: '14.5px', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>
                "Me enteré que tenía una demanda de cobranza de hace dos años. Sin /WEB-IA® nunca lo habría sabido."
              </p>
              <div className="testimonial-author" style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Rodrigo M.</div>
              <div className="testimonial-loc" style={{ color: 'rgba(255,255,255,.45)', fontSize: 12, marginTop: 4 }}>Santiago</div>
            </div>
            <div className="testimonial" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: 32 }}>
              <p className="testimonial-quote" style={{ color: 'rgba(255,255,255,.85)', fontSize: '14.5px', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>
                "Mi mamá es mayor y no sabe usar los portales del Estado. Con esto puedo revisar sus trámites en minutos."
              </p>
              <div className="testimonial-author" style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Valentina C.</div>
              <div className="testimonial-loc" style={{ color: 'rgba(255,255,255,.45)', fontSize: 12, marginTop: 4 }}>Viña del Mar</div>
            </div>
            <div className="testimonial" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: 32 }}>
              <p className="testimonial-quote" style={{ color: 'rgba(255,255,255,.85)', fontSize: '14.5px', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>
                "Trabajo como gestor de trámites y esto me ahorra horas cada semana."
              </p>
              <div className="testimonial-author" style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Felipe A.</div>
              <div className="testimonial-loc" style={{ color: 'rgba(255,255,255,.45)', fontSize: 12, marginTop: 4 }}>Concepción</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="section" id="precios" style={{ padding: '96px 0' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 10, letterSpacing: '-.5px' }}>Precios simples</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Empieza gratis. Actualiza cuando lo necesites. Sin sorpresas.</p>
          </div>
          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
            {/* Free */}
            <div className="plan-card" style={{ border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 24, padding: '36px 32px', position: 'relative', background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.04), 0 1px 3px rgba(10, 10, 14, 0.02)' }}>
              <div className="plan-name" style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Gratuito</div>
              <div className="plan-desc" style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 16 }}>Para explorar el servicio</div>
              <div className="plan-price" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 24 }}>
                <span className="price-currency" style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>$</span>
                <span className="price-amount" style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-1px' }}>0</span>
                <span className="price-period" style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>para siempre</span>
              </div>
              <Link href="/auth/registro" className="btn btn-outline" style={{ width: '100%', border: '2px solid var(--gray-200)', borderRadius: 'var(--radius)', fontWeight: 700, height: 46 }}>Empezar gratis</Link>
              <ul className="plan-features" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> 3 consultas por mes
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Poder Judicial
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Resultados en texto simple
                </li>
              </ul>
            </div>

            {/* Basic */}
            <div className="plan-card popular" style={{ border: '2px solid var(--gray-900)', borderRadius: 24, padding: '36px 32px', position: 'relative', background: '#fff', boxShadow: '0 20px 40px -15px rgba(10,10,14,.12)' }}>
              <div className="popular-badge" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--gray-900)', color: '#fff', borderRadius: 99, padding: '6px 18px', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '.05em', textTransform: 'uppercase' }}>Más popular</div>
              <div className="plan-name" style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Básico</div>
              <div className="plan-desc" style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 16 }}>Para el ciudadano activo</div>
              <div className="plan-price" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 24 }}>
                <span className="price-currency" style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>$</span>
                <span className="price-amount" style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-1px' }}>3.990</span>
                <span className="price-period" style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>al mes</span>
              </div>
              <Link href="/auth/registro?plan=basic" className="btn btn-primary" style={{ width: '100%', borderRadius: 'var(--radius)', fontWeight: 700, height: 46 }}>Comenzar ahora</Link>
              <ul className="plan-features" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Consultas ilimitadas
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Poder Judicial + SII + TGR
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Alertas por email
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Historial 3 meses
                </li>
              </ul>
            </div>

            {/* Premium */}
            <div className="plan-card" style={{ border: '1px solid rgba(10, 10, 14, 0.05)', borderRadius: 24, padding: '36px 32px', position: 'relative', background: '#fff', boxShadow: '0 10px 30px -10px rgba(10, 10, 14, 0.04), 0 1px 3px rgba(10, 10, 14, 0.02)' }}>
              <div className="plan-name" style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Premium</div>
              <div className="plan-desc" style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 16 }}>Todo incluido</div>
              <div className="plan-price" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 24 }}>
                <span className="price-currency" style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>$</span>
                <span className="price-amount" style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-1px' }}>7.990</span>
                <span className="price-period" style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>al mes</span>
              </div>
              <Link href="/auth/registro?plan=premium" className="btn btn-outline" style={{ width: '100%', border: '2px solid var(--gray-200)', borderRadius: 'var(--radius)', fontWeight: 700, height: 46 }}>Obtener Premium</Link>
              <ul className="plan-features" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Todo lo del plan Básico
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Todos los portales
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Alertas por WhatsApp
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Historial ilimitado
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> Resúmenes con IA
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="cta-section" style={{ position: 'relative', padding: '96px 0', textAlign: 'center', overflow: 'hidden', background: 'var(--brand-black)' }}>
        {/* Gradiente de fondo animado */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 70% at 50% 120%, rgba(230,81,0,0.22) 0%, transparent 70%)',
        }} />
        <div aria-hidden style={{
          position: 'absolute', top: -80, left: '10%', width: 300, height: 300,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,81,0,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Stat highlight */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(230,81,0,0.12)', border: '1px solid rgba(230,81,0,0.25)', borderRadius: 99, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-orange)', display: 'inline-block', animation: 'pulse-soft 2s ease infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}>+2.000.000 chilenos con causas activas que no saben</span>
          </div>

          <h2 style={{ color: '#fff', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, marginBottom: 14, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
            ¿Sabes qué dice el Estado
            <br />sobre <span style={{ color: 'var(--brand-orange)' }}>ti</span>?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Revísalo ahora gratis. Sin ClaveÚnica. En menos de 30 segundos.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/registro" className="btn btn-orange btn-lg" style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Consultar ahora, gratis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <button
              onClick={() => startScenario('pjud_legal')}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', borderRadius: 'var(--radius)', padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            >
              Ver demo del copiloto
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 20 }}>
            🔐 Sin contraseña · Sin ClaveÚnica · Datos públicos del Estado
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: '1px solid var(--gray-100)', padding: '40px 0', background: 'var(--brand-bg)' }}>
        <div className="container">
          <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 12, color: 'var(--gray-400)' }}>
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/djadwebia_logo_final.png" alt="DEJAWEBIAR®" style={{ height: 32, width: 'auto', verticalAlign: 'middle' }} />
              <span style={{ color: 'var(--gray-400)', fontSize: 12, marginLeft: 8 }}>· Hecho en Chile 🇨🇱</span>
            </div>
            <div className="footer-links" style={{ display: 'flex', gap: 20 }}>
              <a href="/privacidad" style={{ textDecoration: 'none', color: 'inherit' }}>Privacidad</a>
              <a href="/terminos" style={{ textDecoration: 'none', color: 'inherit' }}>Términos</a>
              <a href="mailto:hola@tramitai.cl" style={{ textDecoration: 'none', color: 'inherit' }}>Contacto</a>
              <a href="/faq" style={{ textDecoration: 'none', color: 'inherit' }}>FAQ</a>
            </div>
            <span>© 2026 DEJAWEBIAR® · AutomatizAI. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* Dynamic Keyframes for spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
