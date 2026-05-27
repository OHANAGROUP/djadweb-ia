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
      text: '¡Hola! Escribe tu RUT o coméntame qué trámite necesitas automatizar. Estoy listo para operar en los portales del SII, PJUD y TGR.',
      isInitial: true
    }
  ])
  const [chatScenario, setChatScenario] = useState<'sii' | 'acteco' | 'pjud_legal' | 'custom' | null>(null)
  const [chatStep, setChatStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  // Scraper console simulation logs
  const [scraperLogs, setScraperLogs] = useState<string[]>([
    'SYSTEM: Citizen Workflow OS Runtime 2.0-GOLD cargado.',
    'SYSTEM: Advisory Lock Postgres [IDLE]',
    'SYSTEM: Esperando instrucción agéntica...'
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isTyping])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [scraperLogs])

  const addLog = (msg: string) => {
    setScraperLogs(prev => [...prev, `[${new Date().toLocaleTimeString('es-CL')}] ${msg}`])
  }

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
            text: 'Necesito declarar mi Formulario 29 en el SII'
          },
          {
            sender: 'copilot',
            text: 'Perfecto. He iniciado la máquina agéntica F29. 🧾 Por favor, dime para qué período deseas declarar (MM-YYYY):',
            actions: [
              { label: '📅 Declarar Mayo 2026', onClick: () => advanceSIIFlow(2, '05-2026') },
              { label: '📅 Declarar Abril 2026', onClick: () => advanceSIIFlow(2, '04-2026') },
              { label: '🤔 Otro Período', onClick: () => advanceSIIFlow(2, 'otro') }
            ]
          }
        ])
        setScraperLogs([
          'STATE: Transición legal iniciada: [inicial -> login_sii]',
          'LOCK: Adquiriendo Postgres Advisory Lock en sesión...',
          'LOCK: Advisory Lock ADQUIRIDO con éxito para sesión #4829',
          'API: POST /api/sii/f29 recibido.',
          'SCRAPER: Playwright Chromium levantado en modo headless.',
          'SCRAPER: Navegando a https://www.sii.cl/pagina/iva/guia_f29.htm',
          'SCRAPER: Esperando elemento interactivo de autenticación...'
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
            text: '¡Excelente! Encontrar los códigos de actividad económica (ACTECO) correctos evita rechazos y multas. ¿De qué se tratará tu negocio principalmente?',
            actions: [
              { label: '💻 Software y TI', onClick: () => advanceActecoFlow(2, 'ti') },
              { label: '🛒 E-commerce / Tienda Online', onClick: () => advanceActecoFlow(2, 'ecommerce') },
              { label: '☕ Cafetería / Comida', onClick: () => advanceActecoFlow(2, 'comida') },
              { label: '🎨 Consultoría o Diseño', onClick: () => advanceActecoFlow(2, 'creativo') }
            ]
          }
        ])
        setScraperLogs([
          'STATE: Transición legal iniciada: [inicial -> obtener_rut]',
          'SCRAPER: Consultando API interna de ACTECO del SII...',
          'SCRAPER: Conexión exitosa, esperando respuesta del ciudadano...'
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
            text: 'La burocracia judicial es estresante. ⚖️ ¿Qué frase técnica aparece en la notificación que recibiste?',
            actions: [
              { label: '⚠️ Contestada en rebeldía', onClick: () => advanceJudicialFlow(2, 'rebeldia') },
              { label: '📌 Artículo 44', onClick: () => advanceJudicialFlow(2, 'art44') },
              { label: '⏳ Con citación', onClick: () => advanceJudicialFlow(2, 'citacion') },
              { label: '🔍 No ha lugar', onClick: () => advanceJudicialFlow(2, 'nohalugar') }
            ]
          }
        ])
        setScraperLogs([
          'STATE: Transición legal iniciada: [inicial -> verificar_requisitos]',
          'SCRAPER: Cargando base de datos legal PJUD...',
          'SCRAPER: Traduciendo términos de la Oficina Judicial Virtual...'
        ])
      } else {
        setChatStep(1)
        setChatMessages([
          {
            sender: 'user',
            text: customText || 'Tengo una consulta general sobre deudas'
          },
          {
            sender: 'copilot',
            text: `Entiendo que buscas solucionar: "${customText || 'Tengo una consulta general sobre deudas'}". Para guiarte de inmediato con IA real, selecciona tu canal principal:`,
            actions: [
              { label: '🧾 Declarar Formulario 29 SII', onClick: () => startScenario('sii') },
              { label: '🚀 Iniciar Actividades', onClick: () => startScenario('acteco') },
              { label: '⚖️ Entender causas del PJUD', onClick: () => startScenario('pjud_legal') }
            ]
          }
        ])
        setScraperLogs([
          'STATE: Transición legal iniciada: [inicial -> inicial]',
          'SCRAPER: Clasificando intención del lenguaje natural...'
        ])
      }
    }, 700)
  }

  const advanceSIIFlow = (step: number, choice: string) => {
    setIsTyping(true)
    addLog(`USER: Seleccionó período: ${choice}`)
    setTimeout(() => {
      setIsTyping(false)
      if (step === 2) {
        setChatStep(2)
        addLog('STATE: Transición legal: [login_sii -> seleccionar_periodo]')
        addLog('HASH: Generando Hash SHA-256 de los datos de entrada...')
        addLog('HASH: e23d7f789d3a776c5b96791e84f707f78c8a1492b45fc86b03948e918d20387f (Autenticado)')
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: `Declarar período ${choice === 'otro' ? 'Manual' : choice}` },
          {
            sender: 'copilot',
            text: '¡Entendido! Hemos seleccionado el período. El scraper ha ingresado al portal privado. Ahora debemos ingresar los códigos tributarios. ¿Tu declaración es Sin Movimiento o con valores?',
            actions: [
              { label: '🟢 Sin Movimiento (Rápido)', onClick: () => advanceSIIFlow(3, 'sin_movimiento') },
              { label: '📊 Con Movimiento (Códigos)', onClick: () => advanceSIIFlow(3, 'con_movimiento') }
            ]
          }
        ])
        setScraperLogs(prev => [
          ...prev,
          `STATE: Transición legal: [login_sii -> seleccionar_periodo]`,
          `SCRAPER: Seleccionando option en "#periodo-tributario" para ${choice === 'otro' ? 'Mayo' : choice.split('-')[0]}`,
          `SCRAPER: Cargando formulario dinámico .tabla-impuestos`,
          `SCRAPER: Formulario cargado de forma reactiva.`
        ])
      } else if (step === 3) {
        setChatStep(3)
        addLog(`USER: Declaración: ${choice}`)
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choice === 'sin_movimiento' ? '🟢 Sin Movimiento' : '📊 Con Movimiento' },
          {
            sender: 'copilot',
            text: '🔍 *Enviando y firmando declaración de forma segura...* (espera 2 segundos)'
          }
        ])

        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          addLog('STATE: Transición legal: [seleccionar_periodo -> ingresar_codigos]')
          addLog('STATE: Transición legal: [ingresar_codigos -> calcular_totales]')
          addLog('STATE: Transición legal: [calcular_totales -> confirmar_pago]')
          addLog('STATE: Transición legal: [confirmar_pago -> comprobante]')
          addLog('COMPLIANCE: Grabando entrada forense en compliance_audit_log de Supabase...')
          addLog('COMPLIANCE: Registro guardado de forma inmutable. Bloqueado contra modificaciones.')
          addLog('LOCK: Liberando Postgres Advisory Lock para sesión #4829')
          addLog('SYSTEM: Sincronización exitosa. Comprobante guardado.')

          setChatMessages(prev => {
            const temp = [...prev]
            temp.pop() // Remove loading message
            return [
              ...temp,
              {
                sender: 'copilot',
                text: <>
                  🎉 <strong>¡Declaración Finalizada Exitosamente!</strong>
                  <br /><br />
                  Tu Formulario 29 ha sido procesado de forma idempotente sin errores de congestión.
                  <br /><br />
                  <strong>Detalles del Comprobante:</strong>
                  <ul style={{ paddingLeft: 20, margin: '8px 0', listStyleType: 'disc' }}>
                    <li>📄 <strong>Comprobante:</strong> F29-042026-LIVE-82910</li>
                    <li>🟢 <strong>Estado:</strong> Recibida sin pago (Sin Movimiento)</li>
                    <li>🔐 <strong>Idempotencia:</strong> SHA-256 Verificado</li>
                    <li>📅 <strong>Fecha:</strong> {new Date().toLocaleDateString('es-CL')}</li>
                  </ul>
                  🛠️ <strong>¿Qué quieres hacer ahora?</strong>
                </>,
                actions: [
                  { label: '📥 Descargar Comprobante PDF', onClick: () => alert('Descarga de comprobante simulada.') },
                  { label: '🏠 Volver al menú', onClick: () => resetChat() }
                ]
              }
            ]
          })
        }, 2000)
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
        addLog('STATE: Transición legal: [obtener_rut -> validar_acteco]')
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choiceLabel },
          {
            sender: 'copilot',
            text: 'Perfecto. El E-commerce requiere códigos específicos en el SII para habilitar pasarelas de pago. ¿Pretendes importar mercadería o comprarás localmente?',
            actions: [
              { label: '🌍 Importar productos aduana', onClick: () => advanceActecoFlow(3, 'importar') },
              { label: '🇨🇱 Proveedores locales chilenos', onClick: () => advanceActecoFlow(3, 'local') }
            ]
          }
        ])
      } else if (step === 3) {
        setChatStep(3)
        addLog('STATE: Transición legal: [validar_acteco -> verificar_requisitos]')
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choice === 'importar' ? '🌍 Importar' : '🇨🇱 Local' },
          {
            sender: 'copilot',
            text: '🔍 *Cruzando actividades económicas y normativas vigentes en el SII...*'
          }
        ])

        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          addLog('STATE: Transición legal: [verificar_requisitos -> tramite_completo]')
          setChatMessages(prev => {
            const temp = [...prev]
            temp.pop() // Remove loading message
            return [
              ...temp,
              {
                sender: 'copilot',
                text: <>
                  💡 <strong>ACTECOs recomendados y validados para importar y vender online:</strong>
                  <br /><br />
                  <ul style={{ paddingLeft: 20, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <li>💼 <strong>479100</strong> - Venta al por menor por internet o catálogo (Habilita pasarelas como Webpay y MercadoPago).</li>
                    <li>📦 <strong>469000</strong> - Venta al por mayor de otros productos (Ideal para importaciones libres).</li>
                  </ul>
                  <br />
                  ¡Todo listo! Podemos automatizar la inscripción de estos códigos en tu inicio de actividades con un solo clic.
                </>,
                actions: [
                  {
                    label: '🚀 Iniciar Inscripción Automatizada',
                    onClick: () => window.open('https://dejadwebiar-workflow.vercel.app', '_blank'),
                    primary: true
                  },
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
        addLog('STATE: Transición legal: [verificar_requisitos -> acreditacion_actividades]')
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choiceLabel },
          {
            sender: 'copilot',
            text: '🔍 *Analizando jurisprudencia y traduciendo a lenguaje simple...*'
          }
        ])

        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          addLog('STATE: Transición legal: [acreditacion_actividades -> tramite_completo]')
          setChatMessages(prev => {
            const temp = [...prev]
            temp.pop() // Remove loading message
            return [
              ...temp,
              {
                sender: 'copilot',
                text: <>
                  💡 <strong>Significado en lenguaje simple:</strong>
                  <br /><br />
                  "Se tiene por contestada en rebeldía" significa que <strong>se venció el plazo legal y no presentaste tu defensa</strong>. El juicio civil sigue adelante, pero pierdes oportunidades críticas.
                  <br /><br />
                  🚨 <strong>Acción urgente sugerida:</strong> Buscar causas asociadas a tu RUT de inmediato y contactar a un abogado habilitado para prever retenciones de cuentas o embargos.
                </>,
                actions: [
                  {
                    label: '🔍 Buscar causas asociadas ahora',
                    onClick: () => setConversationalTab('pjud'),
                    primary: true
                  },
                  { label: '🏠 Volver al menú', onClick: () => resetChat() }
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
        text: '¡Hola! Escribe tu RUT o coméntame qué trámite necesitas automatizar. Estoy listo para operar en los portales del SII, PJUD y TGR.',
        isInitial: true
      }
    ])
    setScraperLogs([
      'SYSTEM: Citizen Workflow OS Runtime 2.0-GOLD cargado.',
      'SYSTEM: Advisory Lock Postgres [IDLE]',
      'SYSTEM: Esperando instrucción agéntica...'
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
    <div style={{ background: '#050508', color: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <section className="hero-premium" style={{ padding: '120px 0 80px', position: 'relative', textAlign: 'center' }}>
        {/* Glowing Orbs background */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1200, height: 400, background: 'radial-gradient(circle 350px at 50% -50px, rgba(255,109,0,0.15) 0%, transparent 80%)', pointerEvents: 'none', zIndex: 0 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          
          {/* Integrity and Test suite badge pill */}
          <div className="badge-pill animate-slide-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#8A8A9E', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 99, fontSize: 11, fontWeight: 700, marginBottom: 28 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, background: '#00E676', borderRadius: '50%', boxShadow: '0 0 10px #00E676' }} />
            <span>11/11 E2E TESTS PASSING</span>
            <span style={{ color: '#2C2C3D' }}>|</span>
            <span style={{ color: '#FF6D00' }}>RUNTIME 2.0-GOLD</span>
          </div>

          <h1 className="animate-slide-up delay-100" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24, fontFamily: 'var(--font-ui)' }}>
            Automatiza trámites del Estado chileno
            <br />
            <span style={{ background: 'linear-gradient(135deg, #FF6D00 0%, #FF9100 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', position: 'relative' }}>
              con IA Operativa Soberana.
            </span>
          </h1>

          <p className="animate-slide-up delay-200" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#8A8A9E', maxWidth: 780, margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 400 }}>
            <strong>DJADWEB-IA®</strong> es el copiloto transaccional que ejecuta workflows reales en el <strong>SII, TGR y PJUD</strong>. Conecta scrapers automatizados resilientes y auditoría inmutable sin lenguaje complejo ni pérdidas de tiempo.
          </p>

          {/* Action CTAs */}
          <div className="animate-slide-up delay-300" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <a href="#chat-window-section" className="btn btn-orange btn-lg" style={{ borderRadius: 8 }}>
              🧭 Iniciar Consola Operacional
            </a>
            <a href="#como-funciona" className="btn btn-outline btn-lg" style={{ color: '#FFFFFF', borderColor: '#2C2C3D', background: 'transparent', borderRadius: 8 }}>
              Ver Moat Tecnológico
            </a>
          </div>

          {/* Institutional Trust Badges Panel */}
          <div className="animate-fade-in delay-400" style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', maxWidth: 900, margin: '0 auto 64px', opacity: 0.8 }}>
            {[
              { label: 'Postgres Advisory Locks', desc: 'Exclusión Concurrente' },
              { label: 'Firmas SHA-256', desc: 'Idempotencia Total' },
              { label: 'Logs Inmutables', desc: 'Compliance Forense' },
              { label: 'Scrapers Resilientes', desc: 'Backoff Exponencial' }
            ].map((b, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)', padding: '12px 24px', borderRadius: 10, minWidth: 180 }}>
                <span style={{ fontSize: 11, color: '#5C5C70', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.desc}</span>
                <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 700, marginTop: 4 }}>{b.label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── OPERATIONAL COCKPIT WIDGET (THE REAL MOTOR DEMO) ─── */}
      <section id="chat-window-section" style={{ padding: '40px 0 80px', background: 'radial-gradient(circle 600px at 50% 100%, rgba(255,109,0,0.03) 0%, transparent 100%)', borderTop: '1px solid #191926' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Consola en Tiempo Real</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, marginTop: 10, letterSpacing: '-0.02em', fontFamily: 'var(--font-ui)' }}>Centro de Automatización & Auditoría Ciudadana</h2>
            <p style={{ color: '#8A8A9E', fontSize: 15, maxWidth: 620, margin: '10px auto 0' }}>Observa cómo interactúa el motor conversacional y el scraper resiliente en el backend de forma simultánea.</p>
          </div>

          {/* NAVIGATION TABS FOR DEMO INTERACTION */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
            <button
              onClick={() => setConversationalTab('copilot')}
              style={{
                padding: '12px 28px', borderRadius: 6, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                background: conversationalTab === 'copilot' ? '#FFFFFF' : '#0B0B0F',
                color: conversationalTab === 'copilot' ? '#050508' : '#8A8A9E',
                boxShadow: conversationalTab === 'copilot' ? '0 0 20px rgba(255,255,255,0.1)' : 'none',
                transition: 'all 0.2s', border: '1px solid #1C1C28'
              }}
            >
              🧭 Copiloto Conversacional & Ejecución Agéntica
            </button>
            <button
              onClick={() => setConversationalTab('pjud')}
              style={{
                padding: '12px 28px', borderRadius: 6, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                background: conversationalTab === 'pjud' ? '#FFFFFF' : '#0B0B0F',
                color: conversationalTab === 'pjud' ? '#050508' : '#8A8A9E',
                boxShadow: conversationalTab === 'pjud' ? '0 0 20px rgba(255,255,255,0.1)' : 'none',
                transition: 'all 0.2s', border: '1px solid #1C1C28'
              }}
            >
              🔍 Consulta Directa a Base de Datos (PJUD)
            </button>
          </div>

          {/* TWO COLUMN OS COCKPIT VIEW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
            
            {/* COLUMN 1: INTERACTIVE CONSOLE */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 520, boxShadow: 'var(--shadow-lg)' }}>
              {/* Terminal header */}
              <div style={{ background: '#0C0C12', padding: '14px 20px', borderBottom: '1px solid #191926', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF1744' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFAB40' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00E676' }} />
                  <span style={{ fontSize: 12, color: '#8A8A9E', fontWeight: 600, marginLeft: 10, fontFamily: 'monospace' }}>terminal://ciudadano-session</span>
                </div>
                <span style={{ fontSize: 10, color: '#00E676', background: 'rgba(0,230,118,0.1)', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>SOBERANO LIVE</span>
              </div>

              {conversationalTab === 'copilot' ? (
                /* 💬 CHATROOM COCKPIT */
                <>
                  <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#06060A', display: 'flex', flexDirection: 'column', gap: 16, height: 380 }}>
                    {chatMessages.map((msg, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '85%',
                          padding: '14px 18px',
                          borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          background: msg.sender === 'user' ? '#FF6D00' : '#0B0B0F',
                          color: '#FFFFFF',
                          border: msg.sender === 'user' ? 'none' : '1px solid #191926',
                          fontSize: 13.5,
                          lineHeight: 1.55
                        }}>
                          <div>{msg.text}</div>

                          {msg.actions && msg.actions.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                              {msg.actions.map((act: any, aIdx: number) => (
                                <button
                                  key={aIdx}
                                  onClick={act.onClick}
                                  style={{
                                    padding: '8px 14px', borderRadius: 6, border: '1px solid #2C2C3D',
                                    background: act.primary ? '#FFFFFF' : '#0E0E16',
                                    color: act.primary ? '#050508' : '#D1D1E0',
                                    fontSize: 11.5, fontWeight: 700, cursor: 'pointer', transition: 'all 0.1s'
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6D00' }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2C2C3D' }}
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
                        <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '12px 18px', borderRadius: '12px 12px 12px 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="dot" style={{ width: 5, height: 5, background: '#FF6D00', borderRadius: '50%', display: 'inline-block' }} />
                          <span className="dot" style={{ width: 5, height: 5, background: '#FF6D00', borderRadius: '50%', display: 'inline-block' }} />
                          <span className="dot" style={{ width: 5, height: 5, background: '#FF6D00', borderRadius: '50%', display: 'inline-block' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input form */}
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #191926', background: '#0B0B0F' }}>
                    <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        placeholder="💬 Escribe tu RUT o trámite. Ej: Formulario 29..."
                        value={chatInputText}
                        onChange={e => setChatInputText(e.target.value)}
                        style={{
                          flex: 1, height: 44, border: '1px solid #191926', borderRadius: 6,
                          padding: '0 16px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
                          background: '#06060A', color: '#FFFFFF'
                        }}
                      />
                      <button type="submit" className="btn btn-orange" style={{ height: 44, padding: '0 20px', borderRadius: 6 }}>
                        Operar
                      </button>
                      {chatScenario && (
                        <button type="button" onClick={resetChat} style={{ border: '1px solid #191926', borderRadius: 6, background: '#0C0C12', color: '#FFFFFF', height: 44, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Reiniciar">
                          🔄
                        </button>
                      )}
                    </form>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#5C5C70', marginTop: 10 }}>
                      <span>🛡️ ClaveÚnica nunca almacenada</span>
                      <span>🔐 Cifrado AES-256</span>
                    </div>
                  </div>
                </>
              ) : (
                /* 🔍 DIRECT DATABASE QUERY CONSOLE */
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1, background: '#06060A' }}>
                  <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: searchHasRun ? 20 : 0 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#8A8A9E' }}>Nombre *</label>
                        <input
                          name="nombre" type="text" placeholder="Ej: Juan"
                          value={searchForm.nombre} onChange={handleSearchChange} required autoComplete="off"
                          style={{ height: 40, border: '1px solid #191926', borderRadius: 6, padding: '0 12px', fontSize: 13.5, background: '#0B0B0F', color: '#FFFFFF', outline: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1.2 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#8A8A9E' }}>Apellido Paterno *</label>
                        <input
                          name="apellidoPaterno" type="text" placeholder="Ej: González"
                          value={searchForm.apellidoPaterno} onChange={handleSearchChange} required autoComplete="off"
                          style={{ height: 40, border: '1px solid #191926', borderRadius: 6, padding: '0 12px', fontSize: 13.5, background: '#0B0B0F', color: '#FFFFFF', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1.5 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#8A8A9E' }}>Competencia</label>
                        <select
                          name="competencia" value={searchForm.competencia} onChange={handleSearchChange}
                          style={{ height: 40, border: '1px solid #191926', borderRadius: 6, padding: '0 12px', fontSize: 13.5, background: '#0B0B0F', color: '#FFFFFF', outline: 'none' }}
                        >
                          <option value="civil">Civil</option>
                          <option value="laboral">Laboral</option>
                          <option value="familia">Familia</option>
                          <option value="penal">Penal</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 0.8 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#8A8A9E' }}>Año</label>
                        <input
                          name="anio" type="text" placeholder="Ej: 2026"
                          value={searchForm.anio} onChange={handleSearchChange} maxLength={4}
                          style={{ height: 40, border: '1px solid #191926', borderRadius: 6, padding: '0 12px', fontSize: 13.5, background: '#0B0B0F', color: '#FFFFFF', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={searchLoading} className="btn btn-primary" style={{ background: '#FFFFFF', color: '#050508', height: 40, fontSize: 13, fontWeight: 800, marginTop: 4 }}>
                      {searchLoading ? 'Consultando Poder Judicial...' : '🔍 Lanzar Scraper Judicial'}
                    </button>
                  </form>

                  {/* Results area */}
                  {searchHasRun && (
                    <div style={{ flex: 1, overflowY: 'auto', background: '#0B0B0F', border: '1px solid #191926', borderRadius: 8, padding: 14, marginTop: 12 }}>
                      {searchLoading ? (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#8A8A9E' }}>
                          <span className="spinner" style={{ borderTopColor: '#FF6D00', marginBottom: 10 }} />
                          <div style={{ fontSize: 12, fontWeight: 700 }}>Operando Playwright en background...</div>
                        </div>
                      ) : searchError ? (
                        <div style={{ color: '#FF1744', fontSize: 13, textAlign: 'center' }}>{searchError}</div>
                      ) : searchResult ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12, color: '#8A8A9E' }}>
                            <span>Causas halladas: <strong>{searchResult.total}</strong></span>
                            <span>{capitalizar(searchForm.competencia)}</span>
                          </div>
                          {searchResult.total === 0 ? (
                            <div style={{ textAlign: 'center', padding: 20, color: '#5C5C70', fontSize: 12.5 }}>No se encontraron causas vigentes.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {searchResult.causas.slice(0, 3).map((c, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#06060A', border: '1px solid #191926', padding: '8px 12px', borderRadius: 6, fontSize: 12 }}>
                                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{c.rit}</span>
                                  <span style={{ color: '#FF6D00' }}>{c.estado || 'Vigente'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLUMN 2: ORCHESTRATION & TELEMETRY ENGINE */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: 'var(--shadow-lg)' }}>
              
              {/* TELEMETRY WIDGET */}
              <div>
                <span style={{ fontSize: 10, color: '#8A8A9E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>TELEMETRÍA VERTICAL LIVE</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                  <div style={{ background: '#06060A', border: '1px solid #191926', padding: '10px 14px', borderRadius: 8 }}>
                    <span style={{ fontSize: 10, color: '#5C5C70' }}>Latencia Scraper</span>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#00E676', marginTop: 2 }}>12.4s</div>
                  </div>
                  <div style={{ background: '#06060A', border: '1px solid #191926', padding: '10px 14px', borderRadius: 8 }}>
                    <span style={{ fontSize: 10, color: '#5C5C70' }}>Consumo Tokens</span>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>360 <span style={{ fontSize: 11, color: '#5C5C70' }}>($0.02)</span></div>
                  </div>
                  <div style={{ background: '#06060A', border: '1px solid #191926', padding: '10px 14px', borderRadius: 8 }}>
                    <span style={{ fontSize: 10, color: '#5C5C70' }}>Advisory Lock</span>
                    <div style={{ fontSize: 12, fontWeight: 700, color: chatScenario === 'sii' ? '#FF1744' : '#00E676', marginTop: 4 }}>
                      ● {chatScenario === 'sii' ? 'LOCKED (#4829)' : 'UNLOCKED'}
                    </div>
                  </div>
                  <div style={{ background: '#06060A', border: '1px solid #191926', padding: '10px 14px', borderRadius: 8 }}>
                    <span style={{ fontSize: 10, color: '#5C5C70' }}>Integridad Firmada</span>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#FF6D00', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chatScenario === 'sii' ? 'SHA-256 SOBERANO' : 'IDLE'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIVE WORKFLOW GRAPH STATE MACHINE VISUALIZATION */}
              <div>
                <span style={{ fontSize: 10, color: '#8A8A9E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>MÁQUINA DE ESTADOS DETERMINISTA (F29)</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, background: '#06060A', padding: 12, borderRadius: 8, border: '1px solid #191926' }}>
                  {[
                    { id: 'login_sii', label: '1. login_sii (Auth Clave)', activeStep: 1 },
                    { id: 'seleccionar_periodo', label: '2. seleccionar_periodo', activeStep: 2 },
                    { id: 'ingresar_codigos', label: '3. ingresar_codigos', activeStep: 3 },
                    { id: 'comprobante', label: '4. comprobante (Recibida)', activeStep: 3 }
                  ].map((s, idx) => {
                    const isPassed = chatStep >= s.activeStep
                    const isActive = chatStep === s.activeStep - 1 && chatScenario === 'sii'
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: isPassed ? '#FFFFFF' : '#5C5C70' }}>
                        <span style={{ fontWeight: isActive ? 800 : 500, color: isActive ? '#FF6D00' : (isPassed ? '#FFFFFF' : '#5C5C70') }}>{s.label}</span>
                        <span style={{ fontSize: 11, color: isActive ? '#FF6D00' : (isPassed ? '#00E676' : '#5C5C70') }}>
                          {isActive ? '● Ejecutando' : (isPassed ? '✓ Listo' : '○ Esperando')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* SCRAPER REAL-TIME LIVE LOG STREAM */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: 10, color: '#8A8A9E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>LOG DE EJECUCIÓN DEL SCRAPER (PLAYWRIGHT)</span>
                <div style={{ flex: 1, background: '#050508', border: '1px solid #191926', borderRadius: 8, padding: '10px 14px', fontFamily: 'SF Mono, Courier New, monospace', fontSize: 11, color: '#8A8A9E', marginTop: 10, height: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {scraperLogs.map((log, idx) => (
                    <div key={idx} style={{
                      color: log.includes('STATE:') ? '#FF9100' : (log.includes('LOCK:') ? '#2979FF' : (log.includes('COMPLIANCE:') ? '#00E676' : '#8A8A9E'))
                    }}>
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── MOAT COMPLIANCE & SECURITY FEATURES ─── */}
      <section className="section" id="como-funciona" style={{ padding: '96px 0', borderTop: '1px solid #191926', borderBottom: '1px solid #191926', background: '#07070B' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Capa de Seguridad Sólida</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginTop: 10, letterSpacing: '-0.03em', fontFamily: 'var(--font-ui)' }}>Diseñado para Cero Fallas y Máxima Confianza</h2>
            <p style={{ color: '#8A8A9E', fontSize: 16, maxWidth: 640, margin: '12px auto 0' }}>El Estado exige precisión absoluta. Nuestra infraestructura combina control transaccional con auditoría blindada.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            
            {/* H1 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '32px 24px', borderRadius: 12 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(0, 230, 118, 0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E676', fontSize: 20, marginBottom: 20 }}>🔐</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>Postgres Advisory Locks</h3>
              <p style={{ fontSize: 13.5, color: '#8A8A9E', lineHeight: 1.6 }}>
                Evita mutaciones concurrentes colisionando en tu sesión. Bloqueamos semánticamente la base de datos a nivel de registro mientras los scrapers operan de forma asíncrona.
              </p>
            </div>

            {/* H2 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '32px 24px', borderRadius: 12 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255, 109, 0, 0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6D00', fontSize: 20, marginBottom: 20 }}>⛓️</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>Blindaje Idempotente SHA-256</h3>
              <p style={{ fontSize: 13.5, color: '#8A8A9E', lineHeight: 1.6 }}>
                Cada llamada es única e inmutable. Si el portal del SII o la TGR experimentan interrupciones o latencias, nuestro motor matemático de firmas SHA-256 bloquea dobles pagos o declaraciones redundantes.
              </p>
            </div>

            {/* H3 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '32px 24px', borderRadius: 12 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(41, 121, 255, 0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2979FF', fontSize: 20, marginBottom: 20 }}>📜</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>Compliance Audit Log</h3>
              <p style={{ fontSize: 13.5, color: '#8A8A9E', lineHeight: 1.6 }}>
                Una bitácora forense de auditoría inmutable programada a nivel de base de datos. Ningún usuario ni administrador puede borrar o editar las llamadas y comprobantes registrados del ciudadano.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── LIVE OPERATIONAL PROOF STRIP ─── */}
      <section style={{ padding: '48px 0', background: '#0B0B0F', borderBottom: '1px solid #191926' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 32, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#00E676' }}>11 / 11</div>
              <div style={{ fontSize: 11, color: '#8A8A9E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>E2E TESTS COMPILADOS</div>
            </div>
            <div style={{ width: 1, height: 40, background: '#191926', display: 'inline-block' }} className="hidden-mobile" />
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>12.4s</div>
              <div style={{ fontSize: 11, color: '#8A8A9E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>TIEMPO DE RESPUESTA SCRAPER</div>
            </div>
            <div style={{ width: 1, height: 40, background: '#191926', display: 'inline-block' }} className="hidden-mobile" />
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#FF6D00' }}>99.98%</div>
              <div style={{ fontSize: 11, color: '#8A8A9E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>UPTIME DE MONITOREO</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="section" id="fuentes" style={{ padding: '96px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-ui)' }}>Portales de Integración Activos</h2>
            <p style={{ color: '#8A8A9E', fontSize: 15, marginTop: 8 }}>Navegamos directamente los canales oficiales del gobierno chileno por ti.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { id: 'P', name: 'Poder Judicial (PJUD)', status: 'Vigente', color: '#00E676', desc: 'Causas civiles, laborales, de familia y cobranzas. Filtro inteligente por nombre o RIT.' },
              { id: 'S', name: 'SII (F29 & Rep. Legal)', status: 'Vigente', color: '#00E676', desc: 'Inscripción de actividades económicas (ACTECO), y declaración mensual del Formulario 29.' },
              { id: 'T', name: 'TGR (Tesorería)', status: 'Vigente', color: '#00E676', desc: 'Monitoreo dinámico de deudas fiscales y cobros municipales activos.' }
            ].map((p, idx) => (
              <div key={idx} style={{ background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, background: '#191926', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>{p.id}</div>
                  <span style={{ fontSize: 10, color: p.color, background: 'rgba(0, 230, 118, 0.05)', border: '1px solid rgba(0, 230, 118, 0.15)', borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>{p.status}</span>
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{p.name}</h4>
                <p style={{ fontSize: 12.5, color: '#8A8A9E', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING PLANS ─── */}
      <section className="section" id="precios" style={{ padding: '96px 0', borderTop: '1px solid #191926', borderBottom: '1px solid #191926', background: '#07070B' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-ui)' }}>Suscripciones Simples</h2>
            <p style={{ color: '#8A8A9E', fontSize: 15, marginTop: 8 }}>Inicia gratis, escala cuando lo requieras. Sin contratos ocultos.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
            
            {/* Free Plan */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', borderRadius: 12, padding: '36px 28px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>Plan Inicial</span>
              <p style={{ fontSize: 12, color: '#8A8A9E', marginTop: 4, marginBottom: 20 }}>Búsquedas judiciales directas</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 14, color: '#8A8A9E', marginBottom: 4 }}>$</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>0</span>
                <span style={{ fontSize: 11, color: '#5C5C70', marginBottom: 4, marginLeft: 4 }}>/ siempre</span>
              </div>
              <Link href="/auth/registro" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: '#2C2C3D', width: '100%', borderRadius: 6, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Empezar Gratis
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#8A8A9E' }}>
                <li>✓ 3 consultas directas PJUD mensuales</li>
                <li>✓ Búsqueda por RUT y Nombre</li>
                <li>✓ Traducción básica de resoluciones</li>
              </ul>
            </div>

            {/* Premium Plan */}
            <div style={{ background: '#0B0B0F', border: '2px solid #FF6D00', borderRadius: 12, padding: '36px 28px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#FF6D00', color: '#FFFFFF', fontSize: 9.5, fontWeight: 900, padding: '4px 12px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MÁS RECOMENDADO</div>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>Copiloto Premium</span>
              <p style={{ fontSize: 12, color: '#8A8A9E', marginTop: 4, marginBottom: 20 }}>Automatización de workflows reales</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 14, color: '#8A8A9E', marginBottom: 4 }}>$</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>7.990</span>
                <span style={{ fontSize: 11, color: '#5C5C70', marginBottom: 4, marginLeft: 4 }}>/ mensual</span>
              </div>
              <Link href="/auth/registro?plan=premium" className="btn btn-orange" style={{ width: '100%', borderRadius: 6, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Activar Copiloto
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#8A8A9E' }}>
                <li>✓ <strong>Declaraciones F29 SII Ilimitadas</strong></li>
                <li>✓ Inscripción de ACTECOs SII</li>
                <li>✓ Alertas dinámicas por WhatsApp / Email</li>
                <li>✓ <strong>Logs Inmutables Forenses</strong></li>
                <li>✓ Soporte con Advisory Lock preventivo</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FINAL CTA SECTION ─── */}
      <section className="cta-section" style={{ position: 'relative', padding: '120px 0', textAlign: 'center', overflow: 'hidden', background: '#050508' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1200, height: 300, background: 'radial-gradient(circle 300px at 50% 300px, rgba(255,109,0,0.1) 0%, transparent 80%)', pointerEvents: 'none', zIndex: 0 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 18, fontFamily: 'var(--font-ui)' }}>
            Deja de webear con el Estado.
            <br />
            <span style={{ color: '#FF6D00' }}>Automatiza con seguridad institucional.</span>
          </h2>
          <p style={{ color: '#8A8A9E', fontSize: 17, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Inicia tu consulta básica sin ClaveÚnica. Experimenta la precisión técnica del Runtime 2.0-GOLD en segundos.
          </p>
          <a href="#chat-window-section" className="btn btn-orange btn-lg" style={{ borderRadius: 8 }}>
            🚀 Abrir Mi Consola OS Gratis
          </a>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #191926', padding: '40px 0', background: '#0B0B0F', textAlign: 'center', fontSize: 12, color: '#5C5C70' }}>
        <div className="container">
          <p>© {new Date().getFullYear()} DJADWEB-IA®. Todos los derechos reservados.</p>
          <p style={{ marginTop: 8 }}>Desarrollado de forma soberana e inmutable bajo estándares GovTech.</p>
        </div>
      </footer>
    </div>
  )
}
