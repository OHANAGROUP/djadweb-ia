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
    <div style={{ background: '#FFFFFF', color: '#0F172A', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Navbar />

      {/* ─── 1. HERO SECTION: ANXIETY RELIEF & PREVENTION-FIRST ─── */}
      <section style={{ padding: '80px 0 60px', position: 'relative', textAlign: 'center', background: 'radial-gradient(1200px circle at 50% -250px, rgba(37,99,235,0.025) 0%, transparent 80%)' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          {/* Trust Banner */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, marginBottom: 24, letterSpacing: '0.02em' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, background: '#2563EB', borderRadius: '50%' }} />
            <span>OPERATIVO EN CHILE</span>
            <span style={{ color: '#E2E8F0' }}>|</span>
            <span>SII • TGR • PODER JUDICIAL</span>
            <span style={{ color: '#E2E8F0' }}>|</span>
            <span style={{ color: '#16A34A' }}>CONEXIÓN ENCRIPTADA</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.1rem, 5.5vw, 3.8rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20, color: '#0F172A' }}>
            Tu F29 mensual listo a tiempo,
            <br />
            <span style={{ color: '#2563EB' }}>incluso si se te olvida.</span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: '#475569', maxWidth: 660, margin: '0 auto 32px', lineHeight: 1.55, fontWeight: 400 }}>
            Tramita prepara automáticamente tus borradores de IVA mensual, supervisa cobros pendientes en Tesorería y te notifica por WhatsApp para protegerte de multas y recargos del SII.
          </p>

          {/* Primary CTA */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-lg" style={{ background: '#2563EB', color: '#FFFFFF', borderRadius: 6, padding: '14px 32px', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.15)' }}>
              Comenzar trámite gratis
            </Link>
            <a href="#como-funciona" className="btn btn-lg" style={{ color: '#475569', border: '1px solid #CBD5E1', background: 'transparent', borderRadius: 6, padding: '14px 32px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Ver funcionamiento
            </a>
          </div>

          {/* ─── 2. P0: REAL PRODUCT DASHBOARD MOCKUP ─── */}
          <div style={{ maxWidth: 940, margin: '0 auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: 6, boxShadow: '0 20px 48px rgba(15,23,42,0.05)', position: 'relative' }}>
            
            {/* Header bar simulated */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '12px 16px', borderRadius: '6px 6px 0 0', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <span style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>
                  Inversiones Soto & Ruiz Ltda. • RUT: 76.982.104-K
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: '#16A34A', fontWeight: 700 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, background: '#16A34A', borderRadius: '50%' }} />
                SINCRONIZADO CON SII & TGR
              </div>
            </div>

            {/* Split realistic dashboard grid */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '0 0 6px 6px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, textAlign: 'left' }}>
              
              {/* Left Column: Deadlines and calendar */}
              <div>
                <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 10, marginBottom: 14 }}>
                  <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Calendario de Obligaciones (2026)</h4>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  
                  {/* Deadline 1 */}
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#92400E' }}>F29 IVA Mayo 2026</div>
                      <div style={{ fontSize: 11, color: '#B45309', marginTop: 2 }}>Vence el 12 de Junio de 2026</div>
                    </div>
                    <span style={{ fontSize: 10, color: '#92400E', background: '#FEF3C7', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>BORRADOR LISTO</span>
                  </div>

                  {/* Deadline 2 */}
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#166534' }}>F29 IVA Abril 2026</div>
                      <div style={{ fontSize: 11, color: '#15803D', marginTop: 2 }}>Presentado el 12 de Mayo de 2026</div>
                    </div>
                    <span style={{ fontSize: 10, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>FOLIO 928310</span>
                  </div>

                  {/* Deadline 3 */}
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#166534' }}>F22 Renta Anual 2026</div>
                      <div style={{ fontSize: 11, color: '#15803D', marginTop: 2 }}>Presentado el 28 de Abril de 2026</div>
                    </div>
                    <span style={{ fontSize: 10, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>FOLIO 810293</span>
                  </div>

                </div>

                <div style={{ marginTop: 16, background: '#F8FAFC', borderRadius: 6, padding: '10px 12px', fontSize: 11, color: '#475569', border: '1px solid #E2E8F0' }}>
                  🕒 <strong>Última verificación de deudas fiscales:</strong> hoy a las 09:12 AM.
                </div>
              </div>

              {/* Right Column: History and status */}
              <div>
                <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 10, marginBottom: 14 }}>
                  <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Historial y Auditoría Reciente</h4>
                </div>

                {/* Simulated Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  
                  {/* Row 1 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: 12 }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#1E293B' }}>F29 Período 04-2026</span>
                      <span style={{ color: '#64748B', marginLeft: 8 }}>SII</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ color: '#64748B' }}>12/05/2026</span>
                      <span style={{ color: '#16A34A', fontWeight: 700 }}>Aceptada</span>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: 12 }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#1E293B' }}>F29 Período 03-2026</span>
                      <span style={{ color: '#64748B', marginLeft: 8 }}>SII</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ color: '#64748B' }}>14/04/2026</span>
                      <span style={{ color: '#16A34A', fontWeight: 700 }}>Aceptada</span>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: 12 }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#1E293B' }}>F22 Declaración Renta</span>
                      <span style={{ color: '#64748B', marginLeft: 8 }}>SII</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ color: '#64748B' }}>28/04/2026</span>
                      <span style={{ color: '#16A34A', fontWeight: 700 }}>Aprobada</span>
                    </div>
                  </div>

                </div>

                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#475569' }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, background: '#16A34A', borderRadius: '50%' }} />
                    <strong>Tesorería (TGR):</strong> $0 CLP cobros o multas asociadas.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#475569' }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, background: '#16A34A', borderRadius: '50%' }} />
                    <strong>Poder Judicial (PJUD):</strong> 0 causas civiles vigentes encontradas.
                  </div>
                </div>

              </div>

            </div>

            {/* WhatsApp Notification overlay */}
            <div style={{ position: 'absolute', bottom: -24, right: 18, background: '#FFFFFF', border: '1px solid #16A34A', borderRadius: 8, padding: '10px 16px', maxWidth: 350, boxShadow: '0 8px 24px rgba(15,23,42,0.06)', display: 'flex', gap: 10, alignItems: 'center', textAlign: 'left', zIndex: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                💬
              </div>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#16A34A', display: 'flex', justifyContent: 'space-between' }}>
                  <span>WhatsApp de Tramita</span>
                  <span>hace 2 min</span>
                </div>
                <p style={{ fontSize: 11, color: '#1E293B', lineHeight: 1.4, marginTop: 2 }}>
                  <strong>Tramita:</strong> Andrea, tu declaración F29 del periodo 05-2026 fue presentada en el SII. Comprobante Folio 928310 adjunto en PDF.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 3. TRANSPARENCY: CREDENTIALS PROTECTION BLOCK (P1) ─── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.9rem)', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
            ¿Por qué confiar en Tramita?
          </h2>
          <p style={{ color: '#475569', fontSize: 13.5, maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.5 }}>
            Entendemos la responsabilidad de proteger tus credenciales. Diseñamos la plataforma bajo estrictos estándares de seguridad bancaria.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, textAlign: 'left' }}>
            
            <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>🔒</div>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Cifrado de Nivel Bancario</h4>
              <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                Tus claves tributarias se almacenan cifradas en reposo mediante **AES-256-GCM**.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>👁️</div>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Acceso de Solo Consulta</h4>
              <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                El sistema interactúa únicamente para descargar borradores y emitir declaraciones sin movimiento autorizadas.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>🚫</div>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Revocación Directa</h4>
              <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                Puedes eliminar tus credenciales y revocar el acceso a nuestro sistema con un solo clic cuando lo decidas.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. TAREAS REALES DIRECTAS ─── */}
      <section style={{ padding: '80px 0 60px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Herramientas Activas</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.2rem)', fontWeight: 800, marginTop: 8, color: '#0F172A' }}>Automatización Operacional e Impuestos</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
            
            {/* Task 1 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 14 }}>🧾</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Declaración de IVA (F29)</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                  Preparamos y presentamos de forma automática tus borradores de Formulario 29 sin movimiento, resguardando tu cumplimiento contable sin esfuerzo.
                </p>
              </div>
              <Link href={user ? "/buscar" : "/auth/registro"} className="btn" style={{ width: '100%', borderRadius: 6, background: '#2563EB', color: '#FFFFFF', fontWeight: 700, padding: '10px 0', textDecoration: 'none', display: 'block', textAlign: 'center', fontSize: 12.5 }}>
                Declarar F29
              </Link>
            </div>

            {/* Task 2 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 14 }}>💰</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Supervisión de Deuda Fiscal</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                  Sincronizamos directamente con la Tesorería General para rastrear giros, contribuciones o multas pendientes asociadas a tu RUT.
                </p>
              </div>
              <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, borderColor: '#CBD5E1', color: '#475569', background: 'transparent', fontWeight: 700, padding: '10px 0', textDecoration: 'none', display: 'block', textAlign: 'center', fontSize: 12.5 }}>
                Verificar Deuda
              </Link>
            </div>

            {/* Task 3 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 14 }}>⚖️</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Monitoreo Judicial ROL</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                  Rastreamos a diario si tu RUT figura en causas de Juzgados Civiles o Laborales de la Oficina Judicial Virtual, traduciendo dictámenes complejos.
                </p>
              </div>
              <Link href={user ? "/buscar" : "/auth/registro"} className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, borderColor: '#CBD5E1', color: '#475569', background: 'transparent', fontWeight: 700, padding: '10px 0', textDecoration: 'none', display: 'block', textAlign: 'center', fontSize: 12.5 }}>
                Monitorear Causas
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 5. CÓMO FUNCIONA (SIMPLE STEPS) ─── */}
      <section id="como-funciona" style={{ padding: '80px 0', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 800, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Operación Directa</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', fontWeight: 800, marginTop: 8, color: '#0F172A' }}>Cómo opera el servicio</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            <div style={{ display: 'flex', gap: 16, background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 20, borderRadius: 8, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(37,99,235,0.06)', color: '#2563EB', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>Ingresas tu RUT</h4>
                <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>Configuras tus datos de forma confidencial y segura en pocos segundos.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 20, borderRadius: 8, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(37,99,235,0.06)', color: '#2563EB', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>El Sistema Sincroniza</h4>
                <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>Supervisamos diariamente tus obligaciones y giros de forma automática en background.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 20, borderRadius: 8, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(37,99,235,0.06)', color: '#2563EB', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>Recibes Comprobantes Oficiales</h4>
                <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>Te enviamos los comprobantes del SII y alertas tributarias directamente a tu WhatsApp.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 6. PRECIOS TRANSPARENTES JUSTIFICADOS ─── */}
      <section id="precios" style={{ padding: '80px 0', background: '#FFFFFF' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Costos del Servicio</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.2rem)', fontWeight: 800, marginTop: 8, color: '#0F172A' }}>Tarifas justificadas de cumplimiento</h2>
            <p style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>Precios diseñados para resguardar la salud fiscal de tu negocio o familia.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
            
            {/* Plan 1 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(15,23,42,0.01)' }}>
              <div>
                <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Ciudadano</h4>
                <div style={{ margin: '14px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: '#0F172A' }}>$0</span>
                  <span style={{ fontSize: 12.5, color: '#475569', marginLeft: 4 }}>gratis siempre</span>
                </div>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                  <strong>Para personas naturales</strong> que desean monitoreo básico de causas del Poder Judicial y alerta mensual de deudas por correo.
                </p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: 16, marginBottom: 24 }}>
                  <li>✅ 1 RUT personal activo</li>
                  <li>✅ Monitoreo de causas judiciales</li>
                  <li>✅ Alertas mensuales por email</li>
                  <li style={{ opacity: 0.4 }}>❌ Sin notificaciones WhatsApp</li>
                </ul>
              </div>
              <Link href="/auth/registro" className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, borderColor: '#CBD5E1', color: '#475569', textDecoration: 'none', display: 'block', textAlign: 'center', padding: '10px 0', fontSize: 12.5, fontWeight: 700 }}>
                Empezar gratis
              </Link>
            </div>

            {/* Plan 2 */}
            <div style={{ background: '#FFFFFF', border: '2px solid #2563EB', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', boxShadow: '0 8px 24px rgba(37,99,235,0.06)' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#2563EB', color: '#FFFFFF', padding: '3px 12px', borderRadius: 99, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.04em' }}>MÁS ADOPTADO</div>
              <div>
                <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan PYME</h4>
                <div style={{ margin: '14px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: '#0F172A' }}>$14.990</span>
                  <span style={{ fontSize: 12.5, color: '#475569', marginLeft: 4 }}>/ mes (CLP)</span>
                </div>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                  <strong>Para empresas que declaran IVA mensual</strong>. Automatiza borradores sin movimiento y monitorea cobros. *Evita multas del SII por retraso de $62.000+ CLP.*
                </p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: 16, marginBottom: 24 }}>
                  <li>✅ Hasta 3 RUTs activos</li>
                  <li>✅ Borrador F29 automático</li>
                  <li>✅ Monitoreo diario de SII y TGR</li>
                  <li>✅ Notificaciones inmediatas en WhatsApp</li>
                </ul>
              </div>
              <Link href="/auth/registro" className="btn" style={{ width: '100%', borderRadius: 6, background: '#2563EB', color: '#FFFFFF', textDecoration: 'none', display: 'block', textAlign: 'center', padding: '10px 0', fontSize: 12.5, fontWeight: 700 }}>
                Obtener Plan PYME
              </Link>
            </div>

            {/* Plan 3 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(15,23,42,0.01)' }}>
              <div>
                <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Contadores</h4>
                <div style={{ margin: '14px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: '#0F172A' }}>$39.990</span>
                  <span style={{ fontSize: 12.5, color: '#475569', marginLeft: 4 }}>/ mes (CLP)</span>
                </div>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                  <strong>Para contadores con cartera de clientes</strong>. Centraliza la auditoría de múltiples empresas. *Ahorro estimado: 25+ horas mensuales de ingreso manual.*
                </p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: 16, marginBottom: 24 }}>
                  <li>✅ Hasta 15 RUTs activos</li>
                  <li>✅ Panel multi-cliente consolidado</li>
                  <li>✅ Historial e informes de declaraciones</li>
                  <li>✅ Soporte prioritario permanente</li>
                </ul>
              </div>
              <Link href="/auth/registro" className="btn btn-ghost" style={{ width: '100%', borderRadius: 6, borderColor: '#CBD5E1', color: '#475569', textDecoration: 'none', display: 'block', textAlign: 'center', padding: '10px 0', fontSize: 12.5, fontWeight: 700 }}>
                Obtener Plan Contadores
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 7. HIGH-TRUST FAQS (PSYCHOLOGICAL BLOCKERS) ─── */}
      <section style={{ padding: '80px 0', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 740, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 800, color: '#0F172A' }}>Preguntas Frecuentes</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'left' }}>
            
            <div>
              <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>¿Es legal que Tramita acceda a mis portales?</h4>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Sí. La información tributaria y judicial en Chile es accesible para el contribuyente o su mandatario técnico. Tramita actúa de forma desatendida y segura bajo tu consentimiento explícito para descargar comprobantes, consolidar deudas y ahorrarte horas de trabajo manual.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>¿Cómo protegen mis claves tributarias?</h4>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Tus claves de acceso nunca se exponen al navegador ni a terceros. Se encriptan inmediatamente en reposo con el algoritmo de grado bancario AES-256-GCM. El descifrado ocurre de manera estricta en servidores seguros aislados en el momento de realizar la verificación.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>¿Puedo darme de baja en cualquier momento?</h4>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Sí. No existen plazos mínimos de permanencia ni contratos de amarre. Puedes pausar o revocar la suscripción y eliminar tus credenciales tributarias de nuestro sistema con un solo clic directamente desde tu panel de control.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 8. FOOTER CORPORATIVO CHILENO COMPLIANCE ─── */}
      <footer style={{ padding: '60px 0', background: '#FFFFFF', fontSize: 12, color: '#475569', textAlign: 'left' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 36, borderBottom: '1px solid #E2E8F0', paddingBottom: 36 }}>
            
            {/* Col 1 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 14 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800, fontSize: 14 }}>
                  T
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Tramita
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5 }}>
                Herramienta corporativa de automatización y cumplimiento tributario mensual para profesionales y pequeñas empresas en Chile.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h5 style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Legitimidad Corporativa</h5>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5 }}>
                <li><strong>Razón Social:</strong> DW Trámites y Tecnología SpA</li>
                <li><strong>RUT Empresa:</strong> 76.982.104-K</li>
                <li><strong>Oficina Central:</strong> Av. Vitacura 2670, Piso 15, Las Condes, Santiago</li>
                <li><strong>Jurisdicción:</strong> República de Chile</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h5 style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Privacidad & SLA</h5>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5 }}>
                <li><strong>Cumplimiento de Privacidad:</strong> Ley 19.628 de Protección de Datos Personales</li>
                <li><strong>SLA de Servicios:</strong> 99.9% de disponibilidad garantizada</li>
                <li><strong>Soporte Técnico:</strong> soporte@dejadwebiar.cl</li>
                <li><strong>Contacto:</strong> +56 2 2897 4500</li>
              </ul>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 11 }}>
            <p>© {new Date().getFullYear()} DW Trámites y Tecnología SpA. Sometido estrictamente bajo la legislación de la República de Chile.</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/terminos" style={{ color: '#475569', textDecoration: 'none' }}>Términos de servicio</Link>
              <Link href="/privacidad" style={{ color: '#475569', textDecoration: 'none' }}>Política de privacidad</Link>
              <Link href="/seguridad" style={{ color: '#475569', textDecoration: 'none' }}>Seguridad</Link>
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}
