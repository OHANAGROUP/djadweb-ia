'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import { PLANS } from '@/lib/plans'
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

  const ctaHref = user ? '/buscar' : '/auth/registro'

  return (
    <div style={{ background: '#FFFFFF', color: '#0F172A', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Navbar />

      {/* ─── 1. HERO ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 60px', textAlign: 'center', background: 'radial-gradient(1200px circle at 50% -250px, rgba(37,99,235,0.025) 0%, transparent 80%)' }}>
        <div style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>

          {/* Trust badge */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, marginBottom: 24, letterSpacing: '0.02em' }}>
            <span style={{ width: 6, height: 6, background: '#2563EB', borderRadius: '50%', display: 'inline-block' }} />
            <span>OPERATIVO EN CHILE</span>
            <span style={{ color: '#E2E8F0' }}>|</span>
            <span>SII · TGR · PODER JUDICIAL</span>
            <span style={{ color: '#E2E8F0' }}>|</span>
            <span style={{ color: '#16A34A' }}>CONEXIÓN ENCRIPTADA</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20, color: '#0F172A' }}>
            Consulta causas, deudas y obligaciones del Estado
            <br />
            <span style={{ color: '#2563EB' }}>desde un solo lugar.</span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: '#475569', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.6, fontWeight: 400 }}>
            Tramita centraliza información del SII, Tesorería General y Poder Judicial para personas, pymes y contadores. Consultas en segundos, alertas automáticas y un asistente que explica todo en lenguaje simple.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <Link href={ctaHref} style={{ background: '#2563EB', color: '#FFFFFF', borderRadius: 6, padding: '14px 32px', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.15)', display: 'inline-block' }}>
              Comenzar gratis
            </Link>
            <a href="#como-funciona" style={{ color: '#475569', border: '1px solid #CBD5E1', background: 'transparent', borderRadius: 6, padding: '14px 32px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              Ver cómo funciona
            </a>
          </div>

          {/* ── Dashboard mockup (datos ilustrativos) ── */}
          <div style={{ maxWidth: 940, margin: '0 auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: 6, boxShadow: '0 20px 48px rgba(15,23,42,0.05)', position: 'relative' }}>

            {/* Header bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '12px 16px', borderRadius: '6px 6px 0 0', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <span style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>
                  Panel de ejemplo · datos ilustrativos
                </span>
              </div>
              {/* Badge datos ilustrativos */}
              <span style={{ fontSize: 9.5, background: '#FEF3C7', color: '#92400E', fontWeight: 800, padding: '3px 8px', borderRadius: 4, border: '1px solid #FDE68A', letterSpacing: '0.03em' }}>
                VISTA PREVIA
              </span>
            </div>

            {/* Dashboard grid */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '0 0 6px 6px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, textAlign: 'left' }}>

              {/* Left: Consultas recientes */}
              <div>
                <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 10, marginBottom: 14 }}>
                  <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Historial de Consultas</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#166534' }}>SII — RUT 76.123.456-7</div>
                      <div style={{ fontSize: 11, color: '#15803D', marginTop: 2 }}>Datos básicos y estado tributario</div>
                    </div>
                    <span style={{ fontSize: 10, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>ACTIVO</span>
                  </div>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#166534' }}>TGR — Deuda fiscal</div>
                      <div style={{ fontSize: 11, color: '#15803D', marginTop: 2 }}>Sin deudas registradas en Tesorería</div>
                    </div>
                    <span style={{ fontSize: 10, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>$0</span>
                  </div>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#166534' }}>PJUD — Causas civiles</div>
                      <div style={{ fontSize: 11, color: '#15803D', marginTop: 2 }}>Sin causas activas encontradas</div>
                    </div>
                    <span style={{ fontSize: 10, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>LIMPIO</span>
                  </div>
                </div>
              </div>

              {/* Right: Asistente */}
              <div>
                <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 10, marginBottom: 14 }}>
                  <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Asistente Tributario</h4>
                </div>
                <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 14, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 12px', borderRadius: 6, fontSize: 12, color: '#1E40AF', lineHeight: 1.5 }}>
                    <strong>Tramita:</strong> El RUT consultado tiene inicio de actividades vigente como "Servicios Profesionales". No registra deudas con el SII ni con Tesorería. No hay causas judiciales activas.
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 12px', borderRadius: 6, fontSize: 11.5, color: '#475569' }}>
                    💡 <em>Resúmenes automáticos disponibles en Plan Contadores</em>
                  </div>
                </div>
                <div style={{ marginTop: 12, background: '#F8FAFC', borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#475569', border: '1px solid #E2E8F0' }}>
                  🕒 <strong>Última consulta:</strong> hace 3 minutos
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── 2. CONFIANZA ────────────────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
        <div style={{ padding: '0 20px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.9rem)', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
            ¿Por qué confiar en Tramita?
          </h2>
          <p style={{ color: '#475569', fontSize: 13.5, maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.5 }}>
            Mantenemos tus datos bajo estrictos estándares de seguridad. Nada se comparte con terceros.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, textAlign: 'left' }}>
            <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>🔒</div>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Conexión Segura</h4>
              <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                Toda comunicación se realiza bajo HTTPS con TLS. Tu sesión se mantiene con tokens seguros HttpOnly.
              </p>
            </div>
            <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>👁️</div>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Solo Lectura</h4>
              <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                Tramita consulta información que tú ya tienes derecho a ver. No modifica ni transmite datos sin tu autorización explícita.
              </p>
            </div>
            <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>🚪</div>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Salida sin Amarre</h4>
              <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                Puedes cancelar tu plan y eliminar tu cuenta en cualquier momento directamente desde el panel de control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. FEATURES ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 60px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Funcionalidades Activas</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.2rem)', fontWeight: 800, marginTop: 8, color: '#0F172A' }}>Consulta. Centraliza. Entiende.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>

            {/* Feature 1 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '32px 24px', borderRadius: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 14 }}>⚖️</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Causas Judiciales (PJUD)</h3>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                Busca en segundos si un RUT tiene causas activas en Juzgados Civiles, Laborales, de Familia o Penales de Chile. Resultados con lenguaje claro.
              </p>
              <Link href={ctaHref} style={{ width: '100%', borderRadius: 6, background: '#2563EB', color: '#FFFFFF', fontWeight: 700, padding: '10px 0', textDecoration: 'none', display: 'block', textAlign: 'center', fontSize: 12.5 }}>
                Consultar PJUD
              </Link>
            </div>

            {/* Feature 2 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '32px 24px', borderRadius: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 14 }}>🧾</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Estado SII y Tesorería</h3>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                Consulta el estado tributario, actividades económicas y deudas fiscales con el SII y la TGR desde un solo formulario, sin navegar múltiples portales.
              </p>
              <Link href={ctaHref} style={{ width: '100%', borderRadius: 6, borderColor: '#CBD5E1', color: '#475569', background: 'transparent', border: '1px solid #CBD5E1', fontWeight: 700, padding: '10px 0', textDecoration: 'none', display: 'block', textAlign: 'center', fontSize: 12.5 }}>
                Consultar SII / TGR
              </Link>
            </div>

            {/* Feature 3 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '32px 24px', borderRadius: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 14 }}>🤖</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Asistente Tributario</h3>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                Guía paso a paso para trámites del SII como inicio de actividades y consultas de estado. El asistente te explica en lenguaje claro qué significa cada resultado.
              </p>
              <Link href={ctaHref} style={{ width: '100%', borderRadius: 6, borderColor: '#CBD5E1', color: '#475569', background: 'transparent', border: '1px solid #CBD5E1', fontWeight: 700, padding: '10px 0', textDecoration: 'none', display: 'block', textAlign: 'center', fontSize: 12.5 }}>
                Abrir asistente
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. CÓMO FUNCIONA ────────────────────────────────────────────────── */}
      <section id="como-funciona" style={{ padding: '80px 0', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ padding: '0 20px', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Simple por diseño</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', fontWeight: 800, marginTop: 8, color: '#0F172A' }}>Cómo funciona</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                n: 1,
                title: 'Ingresa el RUT a consultar',
                desc: 'Escribe el RUT de una persona o empresa y selecciona qué quieres revisar: causas judiciales, estado SII o deudas en Tesorería.',
              },
              {
                n: 2,
                title: 'Tramita consulta los portales del Estado',
                desc: 'El sistema accede en tiempo real a los portales oficiales del Poder Judicial, SII y TGR, y unifica los resultados en una vista clara.',
              },
              {
                n: 3,
                title: 'Recibes los resultados y alertas por email',
                desc: 'Los resultados se muestran en segundos con lenguaje simple. En planes de pago, te enviamos alertas por email cuando detectamos cambios o nuevas obligaciones.',
              },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ display: 'flex', gap: 16, background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 20, borderRadius: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(37,99,235,0.06)', color: '#2563EB', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{n}</div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{title}</h4>
                  <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. PRECIOS ──────────────────────────────────────────────────────── */}
      <section id="precios" style={{ padding: '80px 0', background: '#FFFFFF' }}>
        <div style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Planes y Precios</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.2rem)', fontWeight: 800, marginTop: 8, color: '#0F172A' }}>Elige tu plan</h2>
            <p style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>Sin contratos. Sin permanencia mínima. Cancela cuando quieras.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>

            {/* Plan Ciudadano */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{PLANS.free.displayName}</h4>
                <div style={{ margin: '14px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: '#0F172A' }}>$0</span>
                  <span style={{ fontSize: 12.5, color: '#475569', marginLeft: 6 }}>gratis siempre</span>
                </div>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                  Para personas que quieren verificar su situación ante el Poder Judicial sin costo.
                </p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: 16, marginBottom: 24 }}>
                  {PLANS.free.features.map(f => <li key={f}>✅ {f}</li>)}
                  {PLANS.free.notFeatures.map(f => <li key={f} style={{ opacity: 0.45 }}>❌ {f}</li>)}
                </ul>
              </div>
              <Link href="/auth/registro" style={{ width: '100%', borderRadius: 6, border: '1px solid #CBD5E1', color: '#475569', background: 'transparent', textDecoration: 'none', display: 'block', textAlign: 'center', padding: '10px 0', fontSize: 12.5, fontWeight: 700 }}>
                Empezar gratis
              </Link>
            </div>

            {/* Plan PYME */}
            <div style={{ background: '#FFFFFF', border: '2px solid #2563EB', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', boxShadow: '0 8px 24px rgba(37,99,235,0.06)' }}>
              <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#2563EB', color: '#FFFFFF', padding: '4px 14px', borderRadius: 99, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>MÁS POPULAR</div>
              <div>
                <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{PLANS.basic.displayName}</h4>
                <div style={{ margin: '14px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: '#0F172A' }}>${PLANS.basic.clp!.toLocaleString('es-CL')}</span>
                  <span style={{ fontSize: 12.5, color: '#475569', marginLeft: 6 }}>/mes (CLP)</span>
                </div>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                  Para pymes y emprendedores que quieren centralizar el monitoreo fiscal de hasta 3 empresas.
                </p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: 16, marginBottom: 24 }}>
                  {PLANS.basic.features.map(f => <li key={f}>✅ {f}</li>)}
                  {PLANS.basic.notFeatures.map(f => <li key={f} style={{ opacity: 0.45 }}>❌ {f}</li>)}
                </ul>
              </div>
              <Link href={ctaHref} style={{ width: '100%', borderRadius: 6, background: '#2563EB', color: '#FFFFFF', textDecoration: 'none', display: 'block', textAlign: 'center', padding: '10px 0', fontSize: 12.5, fontWeight: 700 }}>
                Obtener Plan PYME
              </Link>
            </div>

            {/* Plan Contadores */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '32px 24px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{PLANS.premium.displayName}</h4>
                <div style={{ margin: '14px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: '#0F172A' }}>${PLANS.premium.clp!.toLocaleString('es-CL')}</span>
                  <span style={{ fontSize: 12.5, color: '#475569', marginLeft: 6 }}>/mes (CLP)</span>
                </div>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
                  Para contadores que administran una cartera de clientes y necesitan visibilidad consolidada. Ahorra más de 20 horas al mes de consultas manuales.
                </p>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: 16, marginBottom: 24 }}>
                  {PLANS.premium.features.map(f => <li key={f}>✅ {f}</li>)}
                </ul>
              </div>
              <Link href={ctaHref} style={{ width: '100%', borderRadius: 6, border: '1px solid #CBD5E1', color: '#475569', background: 'transparent', textDecoration: 'none', display: 'block', textAlign: 'center', padding: '10px 0', fontSize: 12.5, fontWeight: 700 }}>
                Obtener Plan Contadores
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. FAQS ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ padding: '0 20px', maxWidth: 740, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 800, color: '#0F172A' }}>Preguntas Frecuentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, textAlign: 'left' }}>
            {[
              {
                q: '¿Es legal que Tramita consulte portales del Estado?',
                a: 'Sí. La información del SII, TGR y Poder Judicial es accesible públicamente o para el propio contribuyente. Tramita actúa bajo tu consentimiento explícito para acceder a información que ya tienes derecho a ver, centralizándola en un solo lugar.',
              },
              {
                q: '¿Tramita modifica algo en mis datos del SII o el Poder Judicial?',
                a: 'No. Tramita realiza únicamente consultas de lectura. No realiza declaraciones, pagos ni modificaciones en ningún portal del Estado. Si en el futuro se agreguen funciones de escritura, serán comunicadas claramente y requerirán tu autorización explícita en cada operación.',
              },
              {
                q: '¿Cómo protegen mi información personal?',
                a: 'Todos los datos se transmiten bajo HTTPS con TLS. Las sesiones se manejan con tokens seguros HttpOnly. No almacenamos contraseñas de portales del Estado. Cumplimos con la Ley 19.628 de Protección de Datos Personales de Chile.',
              },
              {
                q: '¿Puedo cancelar en cualquier momento?',
                a: 'Sí, sin restricciones. No hay plazos mínimos ni contratos. Puedes cancelar tu suscripción y eliminar tu cuenta directamente desde el panel de control en cualquier momento.',
              },
              {
                q: '¿Qué pasa si el portal del SII o el PJUD no responde?',
                a: 'Tramita detecta cuando un portal oficial no está disponible y te lo informa claramente. Puedes reintentar en cualquier momento. Mantenemos un historial de consultas anteriores para que siempre tengas acceso al último resultado disponible.',
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>{q}</h4>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. CTA FINAL ────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#FFFFFF', textAlign: 'center' }}>
        <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
            Empieza hoy. Sin costo.
          </h2>
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 32, lineHeight: 1.6 }}>
            Crea tu cuenta en menos de un minuto y verifica tu situación judicial y tributaria gratis.
          </p>
          <Link href="/auth/registro" style={{ background: '#2563EB', color: '#FFFFFF', borderRadius: 6, padding: '16px 40px', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
            Crear cuenta gratuita
          </Link>
        </div>
      </section>

      {/* ─── 8. FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ padding: '60px 0', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', fontSize: 12, color: '#475569' }}>
        <div style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 36, borderBottom: '1px solid #E2E8F0', paddingBottom: 36 }}>

            {/* Col 1: Marca */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800, fontSize: 14 }}>T</div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Tramita</span>
              </div>
              <p style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                Centraliza la consulta de información del SII, Tesorería y Poder Judicial para personas, pymes y contadores en Chile.
              </p>
            </div>

            {/* Col 2: Producto */}
            <div>
              <h5 style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Producto</h5>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <li><a href="#como-funciona" style={{ color: '#475569', textDecoration: 'none' }}>Cómo funciona</a></li>
                <li><a href="#precios" style={{ color: '#475569', textDecoration: 'none' }}>Precios</a></li>
                <li><Link href="/auth/registro" style={{ color: '#475569', textDecoration: 'none' }}>Crear cuenta</Link></li>
                <li><Link href="/contacto" style={{ color: '#475569', textDecoration: 'none' }}>Contacto</Link></li>
              </ul>
            </div>

            {/* Col 3: Legal */}
            <div>
              <h5 style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Legal y Soporte</h5>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5 }}>
                <li><strong>Cumplimiento:</strong> Ley 19.628 de Protección de Datos Personales</li>
                <li><strong>Soporte:</strong> soporte@tramita.cl</li>
                <li><strong>Disponibilidad SLA:</strong> 99% garantizado</li>
                <li>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <Link href="/terminos" style={{ color: '#475569', textDecoration: 'none' }}>Términos</Link>
                    <Link href="/privacidad" style={{ color: '#475569', textDecoration: 'none' }}>Privacidad</Link>
                    <Link href="/seguridad" style={{ color: '#475569', textDecoration: 'none' }}>Seguridad</Link>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 11 }}>
            <p style={{ margin: 0 }}>© {new Date().getFullYear()} Tramita · Herramienta de consulta tributaria y judicial para Chile.</p>
            <p style={{ margin: 0, color: '#94A3B8' }}>Construido con cuidado en Santiago de Chile.</p>
          </div>

        </div>
      </footer>
    </div>
  )
}
