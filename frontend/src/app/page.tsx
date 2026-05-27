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
      text: '¡Hola! Soy tu asistente de trámites. Escribe tu RUT o selecciona una de las opciones para automatizar tu declaración F29 del SII, revisar deudas o consultar tus causas del Poder Judicial de forma simple y en minutos.',
      isInitial: true
    }
  ])
  const [chatScenario, setChatScenario] = useState<'sii' | 'acteco' | 'pjud_legal' | 'custom' | null>(null)
  const [chatStep, setChatStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  // Scraper console simulation logs (hidden by default, togglable for transparency)
  const [showTechnicalLogs, setShowTechnicalLogs] = useState(false)
  const [scraperLogs, setScraperLogs] = useState<string[]>([
    'SYSTEM: Entorno transaccional seguro inicializado.',
    'SECURITY: Protocolo de encriptación bancaria AES-256 activo.',
    'AUDIT: Auditoría automatizada Supabase en línea.',
    'STATUS: Esperando inicio de trámite del ciudadano...'
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
            text: 'Necesito presentar mi Formulario 29 en el SII'
          },
          {
            sender: 'copilot',
            text: 'Excelente. Te ayudaré a declarar tu F29. Por favor, selecciona para qué período deseas realizar tu declaración tributaria mensual:',
            actions: [
              { label: '📅 Mayo 2026', onClick: () => advanceSIIFlow(2, '05-2026') },
              { label: '📅 Abril 2026', onClick: () => advanceSIIFlow(2, '04-2026') },
              { label: '✏️ Otro período tributario', onClick: () => advanceSIIFlow(2, 'otro') }
            ]
          }
        ])
        setScraperLogs([
          'VALIDACIÓN: Estructurando flujo legal para F29.',
          'AUDIT: Generando Hash único de resguardo transaccional.',
          'CONEXIÓN: Iniciando navegador seguro desatendido en el portal del SII...',
          'CONEXIÓN: Acceso establecido exitosamente en la plataforma SII.',
          'SISTEMA: Esperando selección del período por parte del usuario...'
        ])
      } else if (scenarioId === 'acteco') {
        setChatStep(1)
        setChatMessages([
          {
            sender: 'user',
            text: 'Quiero formalizar mi PYME o iniciar actividades'
          },
          {
            sender: 'copilot',
            text: '¡Felicitaciones por emprender! 🚀 Te asistiré para encontrar los códigos de actividad económica (ACTECO) correctos y evitar multas. ¿A qué se dedicará tu negocio principalmente?',
            actions: [
              { label: '💻 Tecnología / Software', onClick: () => advanceActecoFlow(2, 'ti') },
              { label: '🛒 E-commerce / Tienda Online', onClick: () => advanceActecoFlow(2, 'ecommerce') },
              { label: '☕ Gastronomía / Cafetería', onClick: () => advanceActecoFlow(2, 'comida') },
              { label: '🎨 Consultoría o Servicios', onClick: () => advanceActecoFlow(2, 'creativo') }
            ]
          }
        ])
        setScraperLogs([
          'CONEXIÓN: Cargando base de datos oficial de actividades del SII...',
          'SISTEMA: Mapeo de actividades habilitado, esperando respuesta del ciudadano...'
        ])
      } else if (scenarioId === 'pjud_legal') {
        setChatStep(1)
        setChatMessages([
          {
            sender: 'user',
            text: 'Recibí una notificación del Poder Judicial y no la entiendo'
          },
          {
            sender: 'copilot',
            text: 'Las notificaciones judiciales chilenas son complejas. ¿Cuál de estas palabras o términos técnicos aparece en el documento que recibiste?',
            actions: [
              { label: '⚠️ Contestada en rebeldía', onClick: () => advanceJudicialFlow(2, 'rebeldia') },
              { label: '📌 Artículo 44', onClick: () => advanceJudicialFlow(2, 'art44') },
              { label: '⏳ Con citación', onClick: () => advanceJudicialFlow(2, 'citacion') },
              { label: '🔍 No ha lugar', onClick: () => advanceJudicialFlow(2, 'nohalugar') }
            ]
          }
        ])
        setScraperLogs([
          'CONEXIÓN: Cargando glosario de términos de la Oficina Judicial Virtual...',
          'SISTEMA: Analizador legal de causas listo.'
        ])
      } else {
        setChatStep(1)
        setChatMessages([
          {
            sender: 'user',
            text: customText || 'Tengo dudas con un trámite'
          },
          {
            sender: 'copilot',
            text: `Entiendo tu inquietud respecto a: "${customText || 'Tengo dudas con un trámite'}". Para entregarte la solución tributaria o judicial exacta, selecciona el área de tu trámite:`,
            actions: [
              { label: '🧾 Declarar Impuestos (F29 SII)', onClick: () => startScenario('sii') },
              { label: '🚀 Crear una PYME / Empresa', onClick: () => startScenario('acteco') },
              { label: '⚖️ Juicios y Causas Judiciales', onClick: () => startScenario('pjud_legal') }
            ]
          }
        ])
        setScraperLogs([
          'SISTEMA: Clasificando tipo de consulta ciudadana...'
        ])
      }
    }, 700)
  }

  const advanceSIIFlow = (step: number, choice: string) => {
    setIsTyping(true)
    addLog(`SISTEMA: Período configurado: ${choice === 'otro' ? 'Manual' : choice}`)
    setTimeout(() => {
      setIsTyping(false)
      if (step === 2) {
        setChatStep(2)
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: `Declarar período ${choice === 'otro' ? 'Manual' : choice}` },
          {
            sender: 'copilot',
            text: 'Período seleccionado en el SII. Para procesar el formulario, indícame si tu declaración mensual de este mes cuenta con movimientos de venta/compra o si deseas declararla Sin Movimiento:',
            actions: [
              { label: '🟢 Declarar Sin Movimiento', onClick: () => advanceSIIFlow(3, 'sin_movimiento') },
              { label: '📊 Declarar Con Movimiento', onClick: () => advanceSIIFlow(3, 'con_movimiento') }
            ]
          }
        ])
        setScraperLogs(prev => [
          ...prev,
          `VALIDACIÓN: Período seleccionado.`,
          `CONEXIÓN: Accediendo a la sección de impuestos mensuales F29.`,
          `CONEXIÓN: Formulario tributario cargado y verificado.`
        ])
      } else if (step === 3) {
        setChatStep(3)
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choice === 'sin_movimiento' ? '🟢 Declarar Sin Movimiento' : '📊 Declarar Con Movimiento' },
          {
            sender: 'copilot',
            text: '🔄 *Procesando tu declaración de forma segura en los servidores del SII...*'
          }
        ])

        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          addLog('AUDIT: Registro forense inmutable de presentación guardado en Supabase.')
          addLog('SISTEMA: Transacción F29 completada y respaldada.')

          setChatMessages(prev => {
            const temp = [...prev]
            temp.pop() // Remove loading message
            return [
              ...temp,
              {
                sender: 'copilot',
                text: <>
                  🎉 <strong>¡Formulario 29 Declarado con Éxito!</strong>
                  <br /><br />
                  Hemos procesado y validado tu declaración tributaria de forma segura. El comprobante oficial ya está emitido por el SII.
                  <br /><br />
                  <strong>Resumen del Trámite:</strong>
                  <ul style={{ paddingLeft: 20, margin: '8px 0', listStyleType: 'disc' }}>
                    <li>📄 <strong>Comprobante Oficial:</strong> F29-042026-LIVE-82910</li>
                    <li>🟢 <strong>Estado SII:</strong> Recibida sin pago (Aprobada)</li>
                    <li>📅 <strong>Fecha de Presentación:</strong> {new Date().toLocaleDateString('es-CL')}</li>
                  </ul>
                  Te hemos enviado una copia oficial de tu comprobante a tu correo de registro.
                </>,
                actions: [
                  { label: '📥 Descargar Comprobante Oficial PDF', onClick: () => alert('Descarga de comprobante PDF simulada.') },
                  { label: '🏠 Volver al inicio', onClick: () => resetChat() }
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
        let choiceLabel = 'Tecnología'
        if (choice === 'ecommerce') choiceLabel = 'Tienda Online / E-commerce'
        if (choice === 'comida') choiceLabel = 'Gastronomía / Cafetería'
        if (choice === 'creativo') choiceLabel = 'Consultoría o Servicios'

        setChatStep(2)
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choiceLabel },
          {
            sender: 'copilot',
            text: 'Excelente. Las tiendas online tienen regulaciones específicas en Chile. Para sugerirte los códigos de impuestos correctos, ¿pretendes importar mercadería o comprarás a proveedores locales?',
            actions: [
              { label: '🌍 Importar productos aduaneros', onClick: () => advanceActecoFlow(3, 'importar') },
              { label: '🇨🇱 Comprar a proveedores chilenos', onClick: () => advanceActecoFlow(3, 'local') }
            ]
          }
        ])
      } else if (step === 3) {
        setChatStep(3)
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choice === 'importar' ? '🌍 Importación' : '🇨🇱 Proveedores Locales' },
          {
            sender: 'copilot',
            text: '🔍 *Consultando base de actividades comerciales y cruzando normativas...*'
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
                  ✅ <strong>Códigos de Actividad Recomendados y Listos para Inscribir:</strong>
                  <br /><br />
                  <ul style={{ paddingLeft: 20, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <li>💼 <strong>479100</strong> - Venta al por menor por internet o catálogo (Habilita el uso de Webpay y MercadoPago).</li>
                    <li>📦 <strong>469000</strong> - Venta al por mayor de otros productos (Te permite importar volúmenes legalmente).</li>
                  </ul>
                  <br />
                  Podemos automatizar la inscripción de estos códigos en tu ficha del SII de inmediato y sin errores.
                </>,
                actions: [
                  {
                    label: '🚀 Iniciar Inscripción en el SII',
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
        setChatMessages(prev => [
          ...prev,
          { sender: 'user', text: choiceLabel },
          {
            sender: 'copilot',
            text: '🔍 *Traduciendo dictamen judicial a lenguaje claro y sencillo...*'
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
                  💡 <strong>¿Qué significa esto en palabras sencillas?</strong>
                  <br /><br />
                  "Se tiene por contestada en rebeldía" significa que <strong>el plazo para defenderte venció y no presentaste tu respuesta</strong>. El juicio continuará, pero sin tus argumentos iniciales.
                  <br /><br />
                  🚨 <strong>¿Qué debes hacer de inmediato?</strong>
                  <ul style={{ paddingLeft: 20, margin: '8px 0', listStyleType: 'disc' }}>
                    <li>Verificar tus causas vigentes en el Poder Judicial para evitar sorpresas o cobros injustos.</li>
                    <li>Consultar a un abogado especialista para interponer excepciones a la brevedad.</li>
                  </ul>
                </>,
                actions: [
                  {
                    label: '🔍 Buscar causas en la base de datos',
                    onClick: () => setConversationalTab('pjud'),
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

  const resetChat = () => {
    setChatScenario(null)
    setChatStep(0)
    setChatInputText('')
    setChatMessages([
      {
        sender: 'copilot',
        text: '¡Hola! Soy tu asistente de trámites. Escribe tu RUT o selecciona una de las opciones para automatizar tu declaración F29 del SII, revisar deudas o consultar tus causas del Poder Judicial de forma simple y en minutos.',
        isInitial: true
      }
    ])
    setScraperLogs([
      'SYSTEM: Entorno transaccional seguro inicializado.',
      'SECURITY: Protocolo de encriptación bancaria AES-256 activo.',
      'AUDIT: Auditoría automatizada Supabase en línea.',
      'STATUS: Esperando inicio de trámite del ciudadano...'
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

      {/* ─── HERO SECTION: INSTITUTIONAL, TRUSTWORTHY & VALUE-FIRST ─── */}
      <section className="hero-clean" style={{ padding: '130px 0 90px', position: 'relative', textAlign: 'center' }}>
        {/* Soft, warm, non-hacker glowing background */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1200, height: 420, background: 'radial-gradient(circle 380px at 50% -70px, rgba(255,109,0,0.08) 0%, transparent 80%)', pointerEvents: 'none', zIndex: 0 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          
          {/* Uptime and Verification Strip (Clean & Bank-grade) */}
          <div className="badge-pill" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#8A8A9E', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, fontSize: 11, fontWeight: 700, marginBottom: 24 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, background: '#00E676', borderRadius: '50%', boxShadow: '0 0 8px #00E676' }} />
            <span>SISTEMAS ESTATALES: OPERATIVOS</span>
            <span style={{ color: '#2C2C3D' }}>|</span>
            <span style={{ color: '#8A8A9E' }}>UPTIME ANUAL: 99.98%</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, fontFamily: 'var(--font-ui)', color: '#FFFFFF' }}>
            Automatiza tus trámites del
            <br />
            <span style={{ background: 'linear-gradient(135deg, #FF6D00 0%, #FF9100 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
              SII, TGR y Poder Judicial.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#8A8A9E', maxWidth: 660, margin: '0 auto 36px', lineHeight: 1.6, fontWeight: 400 }}>
            Presenta formularios mensuales, consulta tus deudas fiscales y monitorea tus causas de forma segura, simple y automática. Sin lenguaje técnico ni pérdidas de tiempo.
          </p>

          {/* Value Action CTAs */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <a href="#chat-window-section" className="btn btn-orange btn-lg" style={{ borderRadius: 6, padding: '14px 32px' }}>
              🚀 Iniciar Trámite Gratis
            </a>
            <a href="#como-funciona" className="btn btn-outline btn-lg" style={{ color: '#FFFFFF', borderColor: '#2C2C3D', background: 'transparent', borderRadius: 6, padding: '14px 32px' }}>
              Ver cómo funciona
            </a>
          </div>

          {/* Quick Institutional Source Strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', opacity: 0.6, maxWidth: 600, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 800, color: '#FFFFFF' }}>SII</span>
              <span style={{ color: '#5C5C70' }}>Impuestos Internos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 800, color: '#FFFFFF' }}>TGR</span>
              <span style={{ color: '#5C5C70' }}>Tesorería General</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 800, color: '#FFFFFF' }}>PJUD</span>
              <span style={{ color: '#5C5C70' }}>Poder Judicial</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── VALUE CARD SECTION (WHAT CAN YOU DO?) ─── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid #191926', background: '#0C0C12' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Servicios Destacados</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginTop: 8, fontFamily: 'var(--font-ui)', color: '#FFFFFF' }}>¿Qué trámite deseas automatizar hoy?</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
            
            {/* Card 1: F29 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 16 }}>🧾</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>Declarar Formulario 29 (SII)</h3>
                <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.6, marginBottom: 20 }}>
                  Presenta tu IVA mensual de forma segura y en pocos clics. El copiloto automatiza el llenado de códigos y previene inconsistencias tributarias antes de enviar.
                </p>
              </div>
              <a href="#chat-window-section" onClick={() => startScenario('sii')} style={{ fontSize: 12.5, fontWeight: 700, color: '#FF6D00', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Declarar F29 ahora ➡️
              </a>
            </div>

            {/* Card 2: Deudas */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 16 }}>💰</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>Monitorear Deudas Tributarias</h3>
                <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.6, marginBottom: 20 }}>
                  Consultamos y consolidamos automáticamente tus deudas pendientes y multas en el SII y la Tesorería General (TGR). Evita intereses imprevistos.
                </p>
              </div>
              <a href="#chat-window-section" onClick={() => startScenario('custom', 'Quiero consultar mis deudas vigentes')} style={{ fontSize: 12.5, fontWeight: 700, color: '#FF6D00', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Verificar mis deudas ➡️
              </a>
            </div>

            {/* Card 3: PJUD */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 16 }}>⚖️</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>Monitorear Causas Judiciales</h3>
                <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.6, marginBottom: 20 }}>
                  Revisión constante de causas civiles, laborales o de cobranza asociadas a tu RUT en el Poder Judicial. Traducimos escritos difíciles a lenguaje sencillo.
                </p>
              </div>
              <a href="#chat-window-section" onClick={() => startScenario('pjud_legal')} style={{ fontSize: 12.5, fontWeight: 700, color: '#FF6D00', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Revisar causas activas ➡️
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ─── ONBOARDING FLOW: HOW IT WORKS (ULTRA-OBVIOUS & SIMPLIFIED) ─── */}
      <section className="section" id="como-funciona" style={{ padding: '80px 0', background: '#050508' }}>
        <div className="container" style={{ maxWidth: 840 }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Simplicidad Absoluta</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginTop: 8, fontFamily: 'var(--font-ui)', color: '#FFFFFF' }}>Tu trámite listo en 4 simples pasos</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative' }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: 20, background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#191926', color: '#FFFFFF', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Ingresas tus Datos</h3>
                <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.5 }}>
                  Escribe tu RUT de forma segura. La consulta básica es gratuita y no requiere contraseñas complejas.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: 20, background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#191926', color: '#FFFFFF', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>El Copiloto Detecta tu Requerimiento</h3>
                <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.5 }}>
                  Nuestra Inteligencia identifica de inmediato el estado del trámite en el portal del Estado.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: 20, background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#191926', color: '#FFFFFF', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Ejecución Segura en Background</h3>
                <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.5 }}>
                  Los scrapers oficiales procesan la consulta o presentación de forma automatizada y sin colapsos de red.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ display: 'flex', gap: 20, background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#191926', color: '#FFFFFF', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>4</div>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Recibes tu Alerta & Comprobante</h3>
                <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.5 }}>
                  Te notificamos directamente en tu WhatsApp o correo electrónico con tu comprobante tributario o judicial adjunto.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── INTERACTIVE RESOLUTION COCKPIT (CLEAN & REASSURING) ─── */}
      <section style={{ padding: '60px 0', background: '#0C0C12', borderTop: '1px solid #191926', borderBottom: '1px solid #191926' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Portal de Pruebas</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginTop: 8, fontFamily: 'var(--font-ui)', color: '#FFFFFF' }}>Prueba el Copiloto Ciudadano</h2>
            <p style={{ color: '#8A8A9E', fontSize: 14.5, maxWidth: 500, margin: '8px auto 0' }}>Elige un simulador conversacional o realiza una consulta directa en la barra superior.</p>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
            <button
              onClick={() => setConversationalTab('copilot')}
              style={{
                padding: '10px 24px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: conversationalTab === 'copilot' ? '#FFFFFF' : '#0B0B0F',
                color: conversationalTab === 'copilot' ? '#050508' : '#8A8A9E',
                transition: 'all 0.2s', border: '1px solid #191926'
              }}
            >
              🧭 Asistente Virtual Express
            </button>
            <button
              onClick={() => setConversationalTab('pjud')}
              style={{
                padding: '10px 24px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: conversationalTab === 'pjud' ? '#FFFFFF' : '#0B0B0F',
                color: conversationalTab === 'pjud' ? '#050508' : '#8A8A9E',
                transition: 'all 0.2s', border: '1px solid #191926'
              }}
            >
              🔍 Consultar Causas del Poder Judicial
            </button>
          </div>

          {/* SIMULATOR CONTAINER */}
          <div style={{ maxWidth: 680, margin: '0 auto', background: '#0B0B0F', border: '1px solid #191926', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Header bar */}
            <div style={{ background: '#0C0C12', padding: '12px 18px', borderBottom: '1px solid #191926', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, background: '#00E676', borderRadius: '50%' }} />
                <span style={{ fontSize: 12, color: '#8A8A9E', fontWeight: 700 }}>Copiloto de Trámites Online</span>
              </div>
              <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 700 }}>CONEXIÓN ENCRIPTADA</span>
            </div>

            {conversationalTab === 'copilot' ? (
              /* CHAT BODY */
              <>
                <div style={{ height: 350, overflowY: 'auto', padding: '20px', background: '#06060A', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {chatMessages.map((msg, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '85%',
                        padding: '12px 16px',
                        borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        background: msg.sender === 'user' ? '#FF6D00' : '#0B0B0F',
                        color: '#FFFFFF',
                        border: msg.sender === 'user' ? 'none' : '1px solid #191926',
                        fontSize: 13,
                        lineHeight: 1.5
                      }}>
                        <div>{msg.text}</div>

                        {msg.actions && msg.actions.length > 0 && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                            {msg.actions.map((act: any, aIdx: number) => (
                              <button
                                key={aIdx}
                                onClick={act.onClick}
                                style={{
                                  padding: '6px 12px', borderRadius: 4, border: '1px solid #2C2C3D',
                                  background: act.primary ? '#FFFFFF' : '#0E0E16',
                                  color: act.primary ? '#050508' : '#D1D1E0',
                                  fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.1s'
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
                      <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '10px 14px', borderRadius: '12px 12px 12px 2px', display: 'flex', gap: 4 }}>
                        <span className="dot" style={{ width: 4, height: 4, background: '#FF6D00', borderRadius: '50%' }} />
                        <span className="dot" style={{ width: 4, height: 4, background: '#FF6D00', borderRadius: '50%' }} />
                        <span className="dot" style={{ width: 4, height: 4, background: '#FF6D00', borderRadius: '50%' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input block */}
                <div style={{ padding: '14px 18px', borderTop: '1px solid #191926', background: '#0B0B0F' }}>
                  <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Escribe tu consulta tributaria o judicial..."
                      value={chatInputText}
                      onChange={e => setChatInputText(e.target.value)}
                      style={{
                        flex: 1, height: 40, border: '1px solid #191926', borderRadius: 6,
                        padding: '0 12px', fontSize: 13, background: '#06060A', color: '#FFFFFF', outline: 'none'
                      }}
                    />
                    <button type="submit" className="btn btn-orange" style={{ height: 40, padding: '0 16px', borderRadius: 6, fontSize: 12.5 }}>
                      Enviar
                    </button>
                    {chatScenario && (
                      <button type="button" onClick={resetChat} style={{ border: '1px solid #191926', borderRadius: 6, background: '#0C0C12', color: '#FFFFFF', height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Reiniciar">
                        🔄
                      </button>
                    )}
                  </form>
                </div>
              </>
            ) : (
              /* SEARCH BODY */
              <div style={{ padding: 20, background: '#06060A' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: searchHasRun ? 16 : 0 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#8A8A9E' }}>Nombre *</label>
                      <input
                        name="nombre" type="text" placeholder="Ej: Valentina"
                        value={searchForm.nombre} onChange={handleSearchChange} required autoComplete="off"
                        style={{ height: 38, border: '1px solid #191926', borderRadius: 6, padding: '0 10px', fontSize: 13, background: '#0B0B0F', color: '#FFFFFF', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1.2 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#8A8A9E' }}>Apellido Paterno *</label>
                      <input
                        name="apellidoPaterno" type="text" placeholder="Ej: Soto"
                        value={searchForm.apellidoPaterno} onChange={handleSearchChange} required autoComplete="off"
                        style={{ height: 38, border: '1px solid #191926', borderRadius: 6, padding: '0 10px', fontSize: 13, background: '#0B0B0F', color: '#FFFFFF', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1.5 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#8A8A9E' }}>Competencia</label>
                      <select
                        name="competencia" value={searchForm.competencia} onChange={handleSearchChange}
                        style={{ height: 38, border: '1px solid #191926', borderRadius: 6, padding: '0 10px', fontSize: 13, background: '#0B0B0F', color: '#FFFFFF', outline: 'none' }}
                      >
                        <option value="civil">Civil</option>
                        <option value="laboral">Laboral</option>
                        <option value="familia">Familia</option>
                        <option value="penal">Penal</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 0.8 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#8A8A9E' }}>Año</label>
                      <input
                        name="anio" type="text" placeholder="Opcional"
                        value={searchForm.anio} onChange={handleSearchChange} maxLength={4}
                        style={{ height: 38, border: '1px solid #191926', borderRadius: 6, padding: '0 10px', fontSize: 13, background: '#0B0B0F', color: '#FFFFFF', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={searchLoading} className="btn btn-primary" style={{ background: '#FFFFFF', color: '#050508', height: 38, fontSize: 12.5, fontWeight: 800 }}>
                    {searchLoading ? 'Consultando OJV en vivo...' : '🔍 Buscar Causas Activas'}
                  </button>
                </form>

                {searchHasRun && (
                  <div style={{ background: '#0B0B0F', border: '1px solid #191926', borderRadius: 8, padding: 12, marginTop: 12 }}>
                    {searchLoading ? (
                      <div style={{ textAlign: 'center', padding: '20px 10px', color: '#8A8A9E' }}>
                        <span className="spinner" style={{ borderTopColor: '#FF6D00', marginBottom: 8 }} />
                        <div style={{ fontSize: 11.5 }}>Conectando con la Oficina Judicial Virtual...</div>
                      </div>
                    ) : searchError ? (
                      <div style={{ color: '#FF1744', fontSize: 12, textAlign: 'center' }}>{searchError}</div>
                    ) : searchResult ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8, color: '#8A8A9E' }}>
                          <span>Causas vigentes: <strong>{searchResult.total}</strong></span>
                          <span>Competencia: {capitalizar(searchForm.competencia)}</span>
                        </div>
                        {searchResult.total === 0 ? (
                          <div style={{ textAlign: 'center', padding: 15, color: '#5C5C70', fontSize: 12 }}>No registras causas pendientes en el PJUD.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {searchResult.causas.slice(0, 3).map((c, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#06060A', border: '1px solid #191926', padding: '6px 12px', borderRadius: 4, fontSize: 11.5 }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{c.rit}</span>
                                <span style={{ color: '#FF6D00' }}>{c.estado || 'Activo'}</span>
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

            {/* TECHNICAL/AUDIT ACCORDION FOR TRANSPARENCY (THE MOAT ACCESSIBLE BUT HIDDEN) */}
            <div style={{ borderTop: '1px solid #191926', background: '#0C0C12', padding: '10px 18px' }}>
              <button
                onClick={() => setShowTechnicalLogs(!showTechnicalLogs)}
                style={{ background: 'none', border: 'none', color: '#8A8A9E', fontSize: 11, fontWeight: 700, cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>⚙️ Ver bitácora técnica de integridad y auditoría de scrapers</span>
                <span>{showTechnicalLogs ? '▲ Ocultar' : '▼ Mostrar'}</span>
              </button>

              {showTechnicalLogs && (
                <div style={{ background: '#050508', border: '1px solid #191926', borderRadius: 6, padding: 10, fontFamily: 'monospace', fontSize: 10, color: '#8A8A9E', marginTop: 10, maxHeight: 110, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {scraperLogs.map((log, idx) => (
                    <div key={idx} style={{ color: log.includes('AUDIT') ? '#00E676' : (log.includes('VALIDACIÓN') ? '#FF6D00' : '#8A8A9E') }}>
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ─── SECURITY & COMPLIANCE SECTION: BANK-GRADE & REASSURING ─── */}
      <section style={{ padding: '80px 0', background: '#07070B', borderBottom: '1px solid #191926' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Garantías de Cumplimiento</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginTop: 8, fontFamily: 'var(--font-ui)', color: '#FFFFFF' }}>Privacidad y Seguridad de Nivel Bancario</h2>
            <p style={{ color: '#8A8A9E', fontSize: 15, marginTop: 8 }}>Tus gestiones del día a día, protegidas bajo estrictos protocolos institucionales.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            
            {/* Box 1 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 8 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>Respaldo Inmutable (Audit Log)</h3>
              <p style={{ fontSize: 12.5, color: '#8A8A9E', lineHeight: 1.5 }}>
                Cada paso del workflow queda registrado de manera inalterable y auditable por ti. Nadie puede borrar o modificar tus comprobantes.
              </p>
            </div>

            {/* Box 2 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 8 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>Prevención de Duplicados (Idempotencia)</h3>
              <p style={{ fontSize: 12.5, color: '#8A8A9E', lineHeight: 1.5 }}>
                Garantía matemática de transacción única. Si el portal del SII experimenta latencia, el sistema bloquea cualquier doble envío impositivo.
              </p>
            </div>

            {/* Box 3 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 8 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>Criptografía de Datos (AES-256)</h3>
              <p style={{ fontSize: 12.5, color: '#8A8A9E', lineHeight: 1.5 }}>
                Tus credenciales y claves tributarias se procesan de forma encriptada bajo estándares militares AES-256. Nunca almacenamos tu ClaveÚnica.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── BILLING SUSCRIPTION PLANS (CLEAN & INSTITUTIONAL) ─── */}
      <section className="section" id="precios" style={{ padding: '80px 0', background: '#050508' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, fontFamily: 'var(--font-ui)', color: '#FFFFFF' }}>Planes Mensuales</h2>
            <p style={{ color: '#8A8A9E', fontSize: 14.5, marginTop: 8 }}>Comienza de forma gratuita y escala según las necesidades de tu empresa.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 840, margin: '0 auto' }}>
            
            {/* Free */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', borderRadius: 10, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF' }}>Acceso Gratuito</span>
              <p style={{ fontSize: 11.5, color: '#8A8A9E', marginTop: 4, marginBottom: 20 }}>Búsquedas judiciales directas</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: '#8A8A9E', marginBottom: 4 }}>$</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>0</span>
                <span style={{ fontSize: 11, color: '#5C5C70', marginBottom: 4, marginLeft: 4 }}>/ mensual</span>
              </div>
              <Link href="/auth/registro" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: '#2C2C3D', width: '100%', borderRadius: 6, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Empezar Gratis
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#8A8A9E' }}>
                <li>✓ 3 consultas judiciales al mes</li>
                <li>✓ Búsqueda por RUT y Nombre</li>
                <li>✓ Traducción básica de términos</li>
              </ul>
            </div>

            {/* Premium */}
            <div style={{ background: '#0B0B0F', border: '2px solid #FF6D00', borderRadius: 10, padding: '32px 24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#FF6D00', color: '#FFFFFF', fontSize: 9, fontWeight: 900, padding: '3px 12px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MÁS RECOMENDADO</div>
              <span style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF' }}>Copiloto Premium</span>
              <p style={{ fontSize: 11.5, color: '#8A8A9E', marginTop: 4, marginBottom: 20 }}>Automatización tributaria y judicial completa</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: '#8A8A9E', marginBottom: 4 }}>$</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>7.990</span>
                <span style={{ fontSize: 11, color: '#5C5C70', marginBottom: 4, marginLeft: 4 }}>/ mensual</span>
              </div>
              <Link href="/auth/registro?plan=premium" className="btn btn-orange" style={{ width: '100%', borderRadius: 6, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Activar Copiloto Premium
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#8A8A9E' }}>
                <li>✓ <strong>Declaraciones F29 SII Ilimitadas</strong></li>
                <li>✓ Monitoreo permanente de deudas SII y TGR</li>
                <li>✓ Alertas inmediatas por WhatsApp o Email</li>
                <li>✓ Historial transaccional seguro e inmutable</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FINAL CTA SECTION: EMOTIONAL & REASSURING ─── */}
      <section className="cta-section" style={{ position: 'relative', padding: '100px 0', textAlign: 'center', background: '#050508' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1200, height: 280, background: 'radial-gradient(circle 280px at 50% 280px, rgba(255,109,0,0.06) 0%, transparent 80%)', pointerEvents: 'none', zIndex: 0 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14, fontFamily: 'var(--font-ui)', color: '#FFFFFF' }}>
            Deja de sufrir con los trámites del Estado.
          </h2>
          <p style={{ color: '#8A8A9E', fontSize: 16, maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Consolida tu burocracia en un solo panel y descansa con notificaciones automatizadas. Comienza gratis.
          </p>
          <a href="#chat-window-section" className="btn btn-orange btn-lg" style={{ borderRadius: 6, padding: '14px 32px' }}>
            🚀 Iniciar Mi Consulta Gratis
          </a>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #191926', padding: '36px 0', background: '#0B0B0F', textAlign: 'center', fontSize: 12, color: '#5C5C70' }}>
        <div className="container">
          <p>© {new Date().getFullYear()} DJADWEB-IA®. Todos los derechos reservados.</p>
          <p style={{ marginTop: 6, fontSize: 11, color: '#4C4C60' }}>
            Plataforma GovTech independiente. Consultas realizadas bajo la Ley 19.628 de protección de la vida privada.
          </p>
        </div>
      </footer>
    </div>
  )
}
