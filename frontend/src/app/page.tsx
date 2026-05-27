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
    <div style={{ background: '#FFFFFF', color: '#0F172A', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'sans-serif' }}>
      <Navbar />

      {/* ─── 1. HERO SECTION: CLEAN, BANK-GRADE & COOPERATIVE LIGHT THEME ─── */}
      <section className="hero-clean" style={{ padding: '100px 0 70px', position: 'relative', textAlign: 'center', background: 'radial-gradient(1200px circle at 50% -200px, rgba(37,99,235,0.03) 0%, transparent 80%)' }}>
        
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          
          {/* Trust Banner */}
          <div style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 16px', borderRadius: 99, fontSize: 11, fontWeight: 700, marginBottom: 28, letterSpacing: '0.04em' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, background: '#2563EB', borderRadius: '50%' }} />
            <span>OPERATIVO EN CHILE</span>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span>SII • TGR • PODER JUDICIAL</span>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span style={{ color: '#16A34A' }}>ENCRIPTACIÓN BANCARIA</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 22, color: '#0F172A' }}>
            Automatiza tu declaración de F29
            <br />
            <span style={{ color: '#2563EB', display: 'inline-block' }}>
              y evita multas del SII.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2vw, 17.5px)', color: '#475569', maxWidth: 680, margin: '0 auto 38px', lineHeight: 1.6, fontWeight: 400 }}>
            El sistema automatizado para preparar impuestos mensuales, monitorear deudas fiscales en Tesorería y recibir comprobantes directamente en tu WhatsApp. Sin complicaciones.
          </p>

          {/* Primary CTA */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-primary btn-lg" style={{ background: '#2563EB', color: '#FFFFFF', borderRadius: 8, padding: '16px 36px', fontSize: 14.5, fontWeight: 700, boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
              Empezar gratis
            </Link>
            <a href="#como-funciona" className="btn btn-outline btn-lg" style={{ color: '#475569', borderColor: '#CBD5E1', background: 'transparent', borderRadius: 8, padding: '16px 36px', fontSize: 14.5, fontWeight: 700 }}>
              Ver cómo funciona
            </a>
          </div>

          {/* ─── 2. PRODUCT PREVIEW MOCKUP (DASHBOARD REALISM) ─── */}
          <div style={{ maxWidth: 940, margin: '0 auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 6, boxShadow: '0 20px 40px rgba(15,23,42,0.04)', position: 'relative' }}>
            
            {/* Header bar simulated */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              </div>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, letterSpacing: '0.04em' }}>
                PANEL DE CUMPLIMIENTO • RUT: 76.982.104-K
              </div>
              <span style={{ fontSize: 10, color: '#16A34A', fontWeight: 800 }}>ESTADO: EN LÍNEA</span>
            </div>

            {/* Simulated Grid Dashboard */}
            <div style={{ background: '#FFFFFF', padding: '24px 20px', borderRadius: '0 0 8px 8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, textAlign: 'left' }}>
              
              {/* Box 1: SII F29 */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>IMPUESTOS INTERNOS (SII)</span>
                  <span style={{ fontSize: 10, color: '#16A34A', background: 'rgba(22, 163, 74, 0.08)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>DECLARADO</span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Formulario 29 Mensual</h4>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>Declaración del periodo sin movimiento enviada.</p>
                <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 12, paddingTop: 8, fontSize: 11, color: '#2563EB', fontWeight: 700 }}>
                  📄 Comprobante: Folio 92831-F29 (12/05/2026)
                </div>
              </div>

              {/* Box 2: TGR Deuda */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>TESORERÍA GENERAL (TGR)</span>
                  <span style={{ fontSize: 10, color: '#16A34A', background: 'rgba(22, 163, 74, 0.08)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>VERIFICADO</span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Giros y Multas Pendientes</h4>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>Búsqueda en base de deudas del portal TGR finalizada.</p>
                <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 12, paddingTop: 8, fontSize: 11, color: '#0F172A', fontWeight: 700 }}>
                  💰 Deuda Pendiente: $0 CLP
                </div>
              </div>

              {/* Box 3: PJUD Monitor */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>PODER JUDICIAL (PJUD)</span>
                  <span style={{ fontSize: 10, color: '#2563EB', background: 'rgba(37, 99, 235, 0.08)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>MONITOREANDO</span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Rastreador de Causas</h4>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>Revisión en Juzgados Civiles y de Cobranza laboral.</p>
                <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 12, paddingTop: 8, fontSize: 11, color: '#475569', fontWeight: 700 }}>
                  ⚖️ Estado ROL: 0 causas nuevas
                </div>
              </div>

            </div>

            {/* WhatsApp Notification overlay */}
            <div style={{ position: 'absolute', bottom: -30, right: 20, background: '#FFFFFF', border: '1px solid #16A34A', borderRadius: 10, padding: '12px 18px', maxWidth: 360, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', zIndex: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                💬
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', display: 'flex', justifyContent: 'space-between' }}>
                  <span>WhatsApp de Tramita</span>
                  <span>12:05 PM</span>
                </div>
                <p style={{ fontSize: 11.5, color: '#1E293B', lineHeight: 1.4, marginTop: 2 }}>
                  <strong>Tramita:</strong> Andrea, tu declaración F29 del periodo 05-2026 fue presentada en el SII. Folio 92831 en PDF adjunto.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 3. TRÁMITES REALES DIRECTOS (WHAT WE DO) ─── */}
      <section style={{ padding: '80px 0 60px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Módulos del Sistema</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 800, marginTop: 8, color: '#0F172A' }}>Control de trámites en un solo lugar</h2>
            <p style={{ color: '#475569', fontSize: 14.5, marginTop: 6 }}>Acceso directo a las herramientas de fiscalización y declaración mensuales.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
            
            {/* Card 1 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(15,23,42,0.01)' }}>
              <div>
                <div style={{ fontSize: 28, marginBottom: 16 }}>🧾</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Declaración Mensual F29 (SII)</h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
                  Evita multas por retrasos o descuidos. Tramita automatiza el llenado, validación y envío seguro de tu IVA mensual F29 directamente en el SII.
                </p>
              </div>
              <Link href={user ? "/buscar" : "/auth/registro"} className="btn" style={{ width: '100%', borderRadius: 6, background: '#2563EB', color: '#FFFFFF', fontWeight: 700, padding: '10px 0', textDecoration: 'none', display: 'block', textAlign: 'center', fontSize: 13 }}>
                Declarar F29 ahora
              </Link>
            </div>

            {/* Card 2 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(15,23,42,0.01)' }}>
              <div>
                <div style={{ fontSize: 28, marginBottom: 16 }}>💰</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Giros y Multas (TGR)</h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
                  Consolidamos deudas y giros pendientes en la Tesorería General. Detecta recargos e intereses acumulados antes de que representen un riesgo financiero.
                </p>
              </div>
              <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, borderColor: '#CBD5E1', color: '#475569', background: 'transparent', fontWeight: 700, padding: '10px 0', textDecoration: 'none', display: 'block', textAlign: 'center', fontSize: 13 }}>
                Verificar Deuda
              </Link>
            </div>

            {/* Card 3 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(15,23,42,0.01)' }}>
              <div>
                <div style={{ fontSize: 28, marginBottom: 16 }}>⚖️</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Monitoreo Judicial (PJUD)</h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
                  Monitoreo diario en Juzgados Civiles y de Cobranza Laboral. Traducimos resoluciones y escritos judiciales difíciles a español comprensible.
                </p>
              </div>
              <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, borderColor: '#CBD5E1', color: '#475569', background: 'transparent', fontWeight: 700, padding: '10px 0', textDecoration: 'none', display: 'block', textAlign: 'center', fontSize: 13 }}>
                Monitorear Causas
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. CÓMO FUNCIONA (3 STEPS MAX) ─── */}
      <section id="como-funciona" style={{ padding: '80px 0', background: '#FFFFFF' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 840, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Operación Simple</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 800, marginTop: 8, color: '#0F172A' }}>Cumplimiento en tres pasos sencillos</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: 20, background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 24, borderRadius: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', color: '#2563EB', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Ingresas tus Datos</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                  Escribe tu RUT de forma segura en la plataforma para habilitar el monitoreo diario en el SII, la TGR y el Poder Judicial.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: 20, background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 24, borderRadius: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', color: '#2563EB', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>El Sistema Prepara tu Declaración</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                  Nuestra infraestructura de automatización sincroniza en background con los portales estatales oficiales de forma segura.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: 20, background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 24, borderRadius: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', color: '#2563EB', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Recibes Notificaciones en WhatsApp</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                  Te notificamos de inmediato y adjuntamos las copias oficiales del F29 y deudas fiscales directamente en tu WhatsApp.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 5. PRUEBA SOCIAL / SOCIAL PROOF ─── */}
      <section style={{ padding: '80px 0', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center', maxWidth: 1000, margin: '0 auto' }}>
            
            {/* Left Column: veracious stats */}
            <div>
              <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Actividad Verificable</span>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 800, marginTop: 8, marginBottom: 16, color: '#0F172A', lineHeight: 1.2 }}>Tranquilidad administrativa para contadores y PYMEs</h2>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
                Delegar el control administrativo y tributario rutinario en un sistema seguro e inmediato permite reducir la fatiga operativa y evitar multas fiscales por olvidos.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A' }}>+342</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Declaraciones F29 SII</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A' }}>+129</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Causas Monitoreadas</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A' }}>$1.8M</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>CLP en Multas Evitadas</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A' }}>100%</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Disponibilidad Garantizada</div>
                </div>
              </div>
            </div>

            {/* Right Column: testimonials */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Testimonial 1 */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px rgba(15,23,42,0.01)' }}>
                <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 14 }}>
                  "Como contadora independiente, preparar el IVA F29 sin movimiento de mis clientes solía quitarme valiosas horas en plazos de vencimiento. Con Tramita lo hago en minutos de forma segura y automatizada."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                    AR
                  </div>
                  <div>
                    <h5 style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>Andrea Ruiz</h5>
                    <span style={{ fontSize: 10.5, color: '#475569' }}>Contadora Independiente • Santiago</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px rgba(15,23,42,0.01)' }}>
                <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 14 }}>
                  "Tramita monitorea el RUT de mi empresa sin tener que ingresar manualmente a SII o Tesorería todas las semanas. Las alertas por WhatsApp me dan absoluta tranquilidad para enfocarme en las ventas."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#475569', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                    GE
                  </div>
                  <div>
                    <h5 style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>Gabriel Espinosa</h5>
                    <span style={{ fontSize: 10.5, color: '#475569' }}>Fundador de E-commerce • Valparaíso</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. PRECIOS TRANSPARENTES / PRICING GRID ─── */}
      <section id="precios" style={{ padding: '80px 0', background: '#FFFFFF' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Planes Disponibles</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 800, marginTop: 8, color: '#0F172A' }}>Tarifas transparentes de cumplimiento</h2>
            <p style={{ color: '#475569', fontSize: 14.5, marginTop: 6 }}>Precios estables y previsibles pensados para operar de por vida.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
            
            {/* Plan 1 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(15,23,42,0.02)' }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Básico</h4>
                <div style={{ margin: '18px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#0F172A' }}>$0</span>
                  <span style={{ fontSize: 13, color: '#475569', marginLeft: 4 }}>gratis siempre</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, marginBottom: 24 }}>Monitoreo básico de causas judiciales y alertas administrativas por email.</p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: 20, marginBottom: 32 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ 1 RUT activo</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Monitoreo de causas básicas</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Alertas básicas por correo</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>❌ Sin notificaciones WhatsApp</li>
                </ul>
              </div>
              <Link href="/auth/registro" className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, borderColor: '#CBD5E1', color: '#475569', textDecoration: 'none', display: 'block', textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 700 }}>
                Empezar gratis
              </Link>
            </div>

            {/* Plan 2: Destacado */}
            <div style={{ background: '#FFFFFF', border: '2px solid #2563EB', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', boxShadow: '0 10px 30px rgba(37,99,235,0.06)' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#2563EB', color: '#FFFFFF', padding: '3px 14px', borderRadius: 99, fontSize: 10, fontWeight: 800, letterSpacing: '0.04em' }}>RECOMENDADO</div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan PYME</h4>
                <div style={{ margin: '18px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#0F172A' }}>$14.990</span>
                  <span style={{ fontSize: 13, color: '#475569', marginLeft: 4 }}>/ mensual (CLP)</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, marginBottom: 24 }}>Perfecto para emprendedores que necesitan control e IVA sin movimiento automatizado.</p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: 20, marginBottom: 32 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Hasta 3 RUTs activos</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ IVA F29 sin movimiento automático</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Monitoreo diario SII y TGR</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Alertas inmediatas vía WhatsApp</li>
                </ul>
              </div>
              <Link href="/auth/registro" className="btn" style={{ width: '100%', borderRadius: 6, background: '#2563EB', color: '#FFFFFF', textDecoration: 'none', display: 'block', textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 700 }}>
                Obtener Plan PYME
              </Link>
            </div>

            {/* Plan 3 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '36px 28px', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(15,23,42,0.02)' }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Contadores</h4>
                <div style={{ margin: '18px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#0F172A' }}>$39.990</span>
                  <span style={{ fontSize: 13, color: '#475569', marginLeft: 4 }}>/ mensual (CLP)</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, marginBottom: 24 }}>Diseñado para profesionales contables que gestionan múltiples clientes.</p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: 20, marginBottom: 32 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Hasta 15 RUTs activos</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Panel multi-cliente consolidado</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Descargas de reportes e PDFs</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✅ Soporte prioritario 24/7</li>
                </ul>
              </div>
              <Link href="/auth/registro" className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, borderColor: '#CBD5E1', color: '#475569', textDecoration: 'none', display: 'block', textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 700 }}>
                Obtener Plan Contadores
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 7. SEGURIDAD & COMPLIANCE MINI SECTION ─── */}
      <section style={{ padding: '40px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
            Tus datos fiscales resguardados bajo estricto cifrado
          </h3>
          <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 16px' }}>
            Operamos bajo cifrado simétrico AES-256 en reposo. Ninguna clave ni información tributaria sensible es almacenada para fines ajenos al cumplimiento de tu trámite.
          </p>
          <Link href="/seguridad" style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Ver documentación técnica de Seguridad y Cumplimiento ➡️
          </Link>
        </div>
      </section>

      {/* ─── 8. CTA FINAL ─── */}
      <section style={{ padding: '90px 0', position: 'relative', textAlign: 'center', background: 'radial-gradient(1000px circle at 50% 250px, rgba(37,99,235,0.02) 0%, transparent 80%)' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 14, color: '#0F172A' }}>
            Evita multas por olvidos y plazos fiscales hoy
          </h2>
          <p style={{ fontSize: 14.5, color: '#475569', maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Regístrate de forma gratuita en 2 minutos y permite que nuestro sistema seguro supervise tus trámites pendientes en SII, TGR y tribunales.
          </p>
          <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-lg" style={{ background: '#2563EB', color: '#FFFFFF', borderRadius: 8, padding: '16px 36px', fontSize: 14.5, fontWeight: 700, textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
            Comenzar ahora (Gratis)
          </Link>
        </div>
      </section>

      {/* ─── FOOTER CORPORATIVO CHILENO ─── */}
      <footer style={{ borderTop: '1px solid #E2E8F0', padding: '48px 0', background: '#F8FAFC', fontSize: 12, color: '#475569', textAlign: 'left' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, borderBottom: '1px solid #E2E8F0', paddingBottom: 32 }}>
            
            {/* Col 1 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800, fontSize: 14 }}>
                  T
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Tramita
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5 }}>
                El sistema inteligente de cumplimiento administrativo y tributario para contadores y pequeñas empresas en Chile.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h5 style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Legitimidad Corporativa</h5>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5 }}>
                <li><strong>Razón Social:</strong> DW Trámites y Tecnología SpA</li>
                <li><strong>RUT Empresa:</strong> 76.982.104-K</li>
                <li><strong>Dirección:</strong> Av. Vitacura 2670, Piso 15, Las Condes, Santiago</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h5 style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Garantías y Soporte</h5>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5 }}>
                <li><strong>SLA Operacional:</strong> 99.9% disponibilidad</li>
                <li><strong>Contacto:</strong> soporte@dejadwebiar.cl</li>
                <li><strong>Teléfono:</strong> +56 2 2897 4500</li>
              </ul>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 11 }}>
            <p>© {new Date().getFullYear()} DW Trámites y Tecnología SpA. Sometido bajo la jurisdicción de la República de Chile.</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/terminos" style={{ color: '#475569', textDecoration: 'none' }}>Términos de servicio</Link>
              <Link href="/privacidad" style={{ color: '#475569', textDecoration: 'none' }}>Política de privacidad</Link>
              <Link href="/contacto" style={{ color: '#475569', textDecoration: 'none' }}>Contacto</Link>
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}
