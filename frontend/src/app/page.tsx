'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <div style={{ background: '#050508', color: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* ─── 1. HERO SECTION: HIGH-TRUST GOVTECH & CITIZEN RELIEF ─── */}
      <section className="hero-clean" style={{ padding: '120px 0 80px', position: 'relative', textAlign: 'center' }}>
        {/* Soft, warm amber glowing background to represent calm and protection */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1200, height: 450, background: 'radial-gradient(circle 380px at 50% -70px, rgba(255,109,0,0.06) 0%, transparent 80%)', pointerEvents: 'none', zIndex: 0 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          
          {/* Trust strip */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#8A8A9E', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 18px', borderRadius: 99, fontSize: 11, fontWeight: 700, marginBottom: 28, letterSpacing: '0.04em' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, background: '#00E676', borderRadius: '50%', boxShadow: '0 0 8px #00E676' }} />
            <span>OPERATIVO EN CHILE</span>
            <span style={{ color: '#2C2C3D' }}>|</span>
            <span style={{ color: '#8A8A9E' }}>SII • TGR • PODER JUDICIAL</span>
            <span style={{ color: '#2C2C3D' }}>|</span>
            <span style={{ color: '#00E676' }}>100% ENCRIPTADO</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.3rem, 5.5vw, 4.2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 22, color: '#FFFFFF' }}>
            Deja de sufrir con el SII y la
            <br />
            <span style={{ background: 'linear-gradient(135deg, #FF6D00 0%, #FF9100 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
              burocracia del Estado.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#8A8A9E', maxWidth: 680, margin: '0 auto 38px', lineHeight: 1.6, fontWeight: 400 }}>
            Preparamos tu declaración mensual de F29, monitoreamos tus causas judiciales en background y te alertamos por WhatsApp antes de cualquier vencimiento o multa fiscal.
          </p>

          {/* Primary CTA */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
            <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-orange btn-lg" style={{ borderRadius: 8, padding: '16px 36px', fontSize: 15 }}>
              🚀 Iniciar Trámite Gratis
            </Link>
            <a href="#como-funciona" className="btn btn-outline btn-lg" style={{ color: '#FFFFFF', borderColor: '#2C2C3D', background: 'transparent', borderRadius: 8, padding: '16px 36px', fontSize: 15 }}>
              Ver cómo funciona
            </a>
          </div>

          {/* ─── 2. PRODUCT PREVIEW MOCKUP (DASHBOARD REALISM) ─── */}
          <div style={{ maxWidth: 940, margin: '0 auto', background: '#0B0B0F', border: '1px solid #191926', borderRadius: 12, padding: 6, boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
            
            {/* Header bar simulated */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0C0C12', padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #191926' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF1744' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF9100' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E676' }} />
              </div>
              <div style={{ fontSize: 11, color: '#8A8A9E', fontWeight: 600, letterSpacing: '0.04em' }}>
                PANEL CIUDADANO • RUT: 76.203.491-K
              </div>
              <span style={{ fontSize: 10, color: '#00E676', fontWeight: 700 }}>MONITOREO EN VIVO</span>
            </div>

            {/* Simulated Grid Dashboard */}
            <div style={{ background: '#050508', padding: '24px 20px', borderRadius: '0 0 8px 8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, textAlign: 'left' }}>
              
              {/* Box 1: SII F29 */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid #191926', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#8A8A9E', fontWeight: 700 }}>SERVICIO IMPUESTOS INTERNOS</span>
                  <span style={{ fontSize: 10, color: '#00E676', background: 'rgba(0, 230, 118, 0.08)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>DECLARADO</span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Formulario 29 Mensual</h4>
                <p style={{ fontSize: 12, color: '#8A8A9E', lineHeight: 1.4 }}>IVA mensual sin movimiento presentado automáticamente.</p>
                <div style={{ borderTop: '1px solid #191926', marginTop: 12, paddingTop: 8, fontSize: 11, color: '#FF6D00', fontWeight: 700 }}>
                  📄 Comprobante: Folio 92831-LIVE
                </div>
              </div>

              {/* Box 2: TGR Deuda */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid #191926', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#8A8A9E', fontWeight: 700 }}>TESORERÍA GENERAL (TGR)</span>
                  <span style={{ fontSize: 10, color: '#00E676', background: 'rgba(0, 230, 118, 0.08)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>AL DÍA</span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Estado de Deuda Fiscal</h4>
                <p style={{ fontSize: 12, color: '#8A8A9E', lineHeight: 1.4 }}>Búsqueda en base de deudas del portal TGR finalizada.</p>
                <div style={{ borderTop: '1px solid #191926', marginTop: 12, paddingTop: 8, fontSize: 11, color: '#FFFFFF', fontWeight: 600 }}>
                  💰 Deuda Total Vigente: $0 CLP
                </div>
              </div>

              {/* Box 3: PJUD Monitor */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid #191926', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#8A8A9E', fontWeight: 700 }}>PODER JUDICIAL (PJUD)</span>
                  <span style={{ fontSize: 10, color: '#2979FF', background: 'rgba(41, 121, 255, 0.08)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>MONITOREANDO</span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Alertas Judiciales Activas</h4>
                <p style={{ fontSize: 12, color: '#8A8A9E', lineHeight: 1.4 }}>Revisión periódica de escritos en Juzgados Civiles y Laborales.</p>
                <div style={{ borderTop: '1px solid #191926', marginTop: 12, paddingTop: 8, fontSize: 11, color: '#8A8A9E', fontWeight: 600 }}>
                  ⚖️ Causas Vigentes: 0 causas nuevas
                </div>
              </div>

            </div>

            {/* WhatsApp Notification overlay */}
            <div style={{ position: 'absolute', bottom: -30, right: 20, background: '#0B0B0F', border: '1px solid #00E676', borderRadius: 10, padding: '12px 18px', maxWidth: 360, boxShadow: 'var(--shadow-lg)', display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#00E676', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                💬
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#00E676', display: 'flex', justifyContent: 'space-between' }}>
                  <span>WhatsApp de Alerta</span>
                  <span>hace 1 min</span>
                </div>
                <p style={{ fontSize: 11.5, color: '#FFFFFF', lineHeight: 1.4, marginTop: 2 }}>
                  <strong>DJADWEB-IA®:</strong> Andrea, tu Formulario 29 fue validado y presentado con éxito. Copia del comprobante SII en PDF adjunto.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 3. TRÁMITES REALES DIRECTOS (WHAT WE DO) ─── */}
      <section style={{ padding: '80px 0 60px', borderTop: '1px solid #191926', background: '#0C0C12' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Trámites Soportados</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 800, marginTop: 8, color: '#FFFFFF' }}>Acciones Concretas Inmediatas</h2>
            <p style={{ color: '#8A8A9E', fontSize: 14.5, marginTop: 6 }}>Elige el trámite específico que requieres ejecutar de forma automática hoy.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
            
            {/* Card 1 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 28, marginBottom: 16 }}>🧾</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>Declarar IVA Formulario 29</h3>
                <p style={{ fontSize: 13.5, color: '#8A8A9E', lineHeight: 1.6, marginBottom: 24 }}>
                  Evita multas por olvido de plazos. Nuestro copiloto automatiza la validación e inicio de sesión seguro en el SII para presentar tu declaración F29 sin errores.
                </p>
              </div>
              <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-orange" style={{ width: '100%', borderRadius: 6 }}>
                Declarar F29 ahora
              </Link>
            </div>

            {/* Card 2 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 28, marginBottom: 16 }}>💰</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>Verificar Deuda Fiscal (TGR)</h3>
                <p style={{ fontSize: 13.5, color: '#8A8A9E', lineHeight: 1.6, marginBottom: 24 }}>
                  Consolidamos deudas y giros fiscales en Tesorería. Te ayudamos a detectar deudas imprevistas o convenios de pago antes de que devenguen intereses.
                </p>
              </div>
              <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, color: '#FFFFFF' }}>
                Verificar Deuda
              </Link>
            </div>

            {/* Card 3 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 28, marginBottom: 16 }}>⚖️</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>Monitorear Causas Judiciales</h3>
                <p style={{ fontSize: 13.5, color: '#8A8A9E', lineHeight: 1.6, marginBottom: 24 }}>
                  Revisamos diariamente si tu RUT figura en el Poder Judicial. Traducimos escritos difíciles de juzgados civiles o laborales a explicaciones sencillas.
                </p>
              </div>
              <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, border: '1.5px solid var(--gray-200)', background: 'transparent', color: '#FFFFFF', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, fontSize: 13, fontWeight: 700 }}>
                Monitorear Causas
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. CÓMO FUNCIONA (3 STEPS MAX) ─── */}
      <section id="como-funciona" style={{ padding: '80px 0', background: '#050508' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 840, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Simplicidad Total</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 800, marginTop: 8, color: '#FFFFFF' }}>El alivio estatal en 3 pasos</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: 20, background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,109,0,0.1)', color: '#FF6D00', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Ingresas tu RUT</h3>
                <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.5 }}>
                  Realiza la consulta básica de deudas y monitoreo de causas de forma 100% gratuita y segura, sin contratos extensos.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: 20, background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,109,0,0.1)', color: '#FF6D00', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>El Copiloto Seguro Automatiza</h3>
                <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.5 }}>
                  Nuestros scrapers en background interactúan de forma robusta y encriptada con los portales estatales para procesar tus trámites.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: 20, background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,109,0,0.1)', color: '#FF6D00', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Recibes Comprobantes en WhatsApp</h3>
                <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.5 }}>
                  Te notificamos directamente en tu celular con los reportes e PDFs de impuestos emitidos por las entidades oficiales.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 5. PRUEBA SOCIAL / SOCIAL PROOF (REAL METRICS & TESTIMONIALS) ─── */}
      <section style={{ padding: '80px 0', borderTop: '1px solid #191926', background: '#0C0C12' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center', maxWidth: 1000, margin: '0 auto' }}>
            
            {/* Left Column: veracious stats */}
            <div>
              <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Impacto y Números</span>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 800, marginTop: 8, marginBottom: 16, color: '#FFFFFF', lineHeight: 1.2 }}>Trámites que importan a personas reales</h2>
              <p style={{ color: '#8A8A9E', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
                Automatizamos la relación administrativa con el Estado para que puedas dedicarte enteramente a hacer crecer tu actividad comercial o descansar con tranquilidad.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>+342</div>
                  <div style={{ fontSize: 12, color: '#8A8A9E', marginTop: 4 }}>Declaraciones F29 SII</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>+129</div>
                  <div style={{ fontSize: 12, color: '#8A8A9E', marginTop: 4 }}>Causas Monitoreadas</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>$1.8M</div>
                  <div style={{ fontSize: 12, color: '#8A8A9E', marginTop: 4 }}>Pesos en Multas Evitadas</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>100%</div>
                  <div style={{ fontSize: 12, color: '#8A8A9E', marginTop: 4 }}>Cumplimiento Legal</div>
                </div>
              </div>
            </div>

            {/* Right Column: testimonials */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Testimonial 1 */}
              <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 12 }}>
                <p style={{ fontSize: 13, color: '#D1D1E0', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 14 }}>
                  "Como contadora independiente, declarar el F29 de mis clientes pequeños solía tomarme todo el día en plazos críticos del SII. Con DJADWEB-IA® lo hago en minutos y sin errores de tipeo manual."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FF6D00', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                    AR
                  </div>
                  <div>
                    <h5 style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>Andrea Ruiz</h5>
                    <span style={{ fontSize: 10.5, color: '#8A8A9E' }}>Contadora Independiente • Santiago</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: 24, borderRadius: 12 }}>
                <p style={{ fontSize: 13, color: '#D1D1E0', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 14 }}>
                  "Monitoreo el estado de mi pyme sin tener que recordar ingresar al portal del SII todos los meses. Las alertas por WhatsApp automáticas me salvan de recargos e intereses imprevistos."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2979FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                    GE
                  </div>
                  <div>
                    <h5 style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>Gabriel Espinosa</h5>
                    <span style={{ fontSize: 10.5, color: '#8A8A9E' }}>Fundador de Tienda E-commerce • Valparaíso</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. PRECIOS TRANSPARENTES / PRICING GRID ─── */}
      <section id="precios" style={{ padding: '80px 0', background: '#050508' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#FF6D00', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Tarifas Claras</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 800, marginTop: 8, color: '#FFFFFF' }}>Planes simples adaptados a ti</h2>
            <p style={{ color: '#8A8A9E', fontSize: 14.5, marginTop: 6 }}>Sin letra chica ni cobros imprevistos. Cancela cuando quieras.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
            
            {/* Plan 1 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#8A8A9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Ciudadano</h4>
                <div style={{ margin: '18px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>$0</span>
                  <span style={{ fontSize: 13, color: '#8A8A9E', marginLeft: 4 }}>gratis de por vida</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#8A8A9E', lineHeight: 1.5, marginBottom: 24 }}>Ideal para personas naturales que desean control básico.</p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#D1D1E0', borderTop: '1px solid #191926', paddingTop: 20, marginBottom: 32 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ 1 RUT activo</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Monitoreo de causas básicas</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Alertas básicas por correo</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>❌ Sin alertas por WhatsApp</li>
                </ul>
              </div>
              <Link href="/auth/registro" className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, color: '#FFFFFF' }}>
                Empezar Gratis
              </Link>
            </div>

            {/* Plan 2: Destacado */}
            <div style={{ background: '#0C0C12', border: '2px solid #FF6D00', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#FF6D00', color: '#FFFFFF', padding: '3px 14px', borderRadius: 99, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.04em' }}>RECOMENDADO</div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#FF6D00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan PYME</h4>
                <div style={{ margin: '18px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>$9.990</span>
                  <span style={{ fontSize: 13, color: '#8A8A9E', marginLeft: 4 }}>/ mensual (CLP)</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#8A8A9E', lineHeight: 1.5, marginBottom: 24 }}>Perfecto para emprendedores que necesitan tranquilidad tributaria.</p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#D1D1E0', borderTop: '1px solid #191926', paddingTop: 20, marginBottom: 32 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Hasta 3 RUTs activos</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Declaración F29 sin movimiento</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Monitoreo diario SII y TGR</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Alertas instantáneas vía WhatsApp</li>
                </ul>
              </div>
              <Link href="/auth/registro" className="btn btn-orange" style={{ width: '100%', borderRadius: 6 }}>
                Obtener Plan PYME
              </Link>
            </div>

            {/* Plan 3 */}
            <div style={{ background: '#0B0B0F', border: '1px solid #191926', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#8A8A9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Contadores</h4>
                <div style={{ margin: '18px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>$24.990</span>
                  <span style={{ fontSize: 13, color: '#8A8A9E', marginLeft: 4 }}>/ mensual (CLP)</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#8A8A9E', lineHeight: 1.5, marginBottom: 24 }}>Para profesionales con múltiples carteras de clientes.</p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#D1D1E0', borderTop: '1px solid #191926', paddingTop: 20, marginBottom: 32 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Hasta 15 RUTs activos</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Panel consolidado de clientes</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Carga de movimientos automática</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Soporte telefónico prioritario</li>
                </ul>
              </div>
              <Link href="/auth/registro" className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, color: '#FFFFFF' }}>
                Obtener Plan Contadores
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 7. SEGURIDAD & COMPLIANCE MINI SECTION ─── */}
      <section style={{ padding: '40px 0', borderTop: '1px solid #191926', borderBottom: '1px solid #191926', background: '#0C0C12' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>
            Tus datos tributarios resguardados por ley
          </h3>
          <p style={{ fontSize: 12.5, color: '#8A8A9E', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 16px' }}>
            Operamos bajo encriptación simétrica AES-256-GCM y bitácoras forenses inmutables. Ningún dato sensible es compartido ni utilizado para fines distintos a tu trámite.
          </p>
          <Link href="/seguridad" style={{ fontSize: 12, fontWeight: 700, color: '#2979FF', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Ver documentación técnica en Seguridad & Cumplimiento ➡️
          </Link>
        </div>
      </section>

      {/* ─── 8. CTA FINAL ─── */}
      <section style={{ padding: '90px 0', position: 'relative', textAlign: 'center' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1200, height: 300, background: 'radial-gradient(circle 350px at 50% 300px, rgba(255,109,0,0.04) 0%, transparent 80%)', pointerEvents: 'none', zIndex: 0 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 14, color: '#FFFFFF' }}>
            Evita multas y filas con el Estado hoy mismo
          </h2>
          <p style={{ fontSize: 14.5, color: '#8A8A9E', maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Regístrate en 2 minutos y delega el estrés de la fiscalización del SII, la TGR y los tribunales a un copiloto determinista seguro.
          </p>
          <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-orange btn-lg" style={{ borderRadius: 8, padding: '16px 36px', fontSize: 15 }}>
            Comenzar ahora (Gratis)
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: '1px solid #191926', padding: '48px 0', background: '#050508', fontSize: 12, color: '#5C5C70' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <p>© {new Date().getFullYear()} DJADWEB-IA®. Todos los derechos reservados. Operado bajo la legislación de la República de Chile.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/terminos" style={{ color: '#5C5C70', textDecoration: 'none' }}>Términos de servicio</Link>
            <Link href="/privacidad" style={{ color: '#5C5C70', textDecoration: 'none' }}>Política de privacidad</Link>
            <Link href="/contacto" style={{ color: '#5C5C70', textDecoration: 'none' }}>Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
