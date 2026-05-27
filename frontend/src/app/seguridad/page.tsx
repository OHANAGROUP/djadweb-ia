'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function SeguridadPage() {
  const [scraperLogs, setScraperLogs] = useState<string[]>([
    'SYSTEM: Entorno transaccional seguro inicializado.',
    'SECURITY: Protocolo de encriptación bancaria AES-256 activo.',
    'AUDIT: Auditoría automatizada Supabase en línea.',
    'DB_LOCK: Solicitando advisory lock en PostgreSQL para sesión 76192...',
    'DB_LOCK: Lock obtenido exitosamente. Previniendo colisiones concurrentes.',
    'STATE_MACHINE: Hash SHA-256 generado: 83867ebfdb0f911777ede78ed465ec382897bd04',
    'STATE_MACHINE: Transición legal de estado validada por Grafo Determinista (inicial -> login_sii).',
    'BROWSER: Levantando instancia headless aislada (Playwright Chromium).',
    'BROWSER: Parámetros aplicados: --no-sandbox, --disable-setuid-sandbox.',
    'CORRELATION: X-Correlation-ID: 7c2a9a2d-20be-4573-b26a-939e144f8ea0 generado.',
    'SII_PORTAL: Estableciendo sesión cifrada TLS 1.3 con sii.cl...',
    'SII_PORTAL: Formulario 29 cargado exitosamente. Período MM-YYYY: 05-2026.',
    'SII_PORTAL: Asistente RCV detectado. Extrayendo sugerencia de impuestos...',
    'SII_PORTAL: Total a pagar calculado (Código 91) = $0 CLP (Sin Movimiento).',
    'SII_PORTAL: Enviando declaración F29 de forma segura...',
    'SII_PORTAL: Comprobante F29 emitido exitosamente. ID: F29-042026-LIVE-82910.',
    'COMPLIANCE_LOG: Guardando traza inmutable firmada en base de datos.',
    'COMPLIANCE_LOG: Registro bloqueado (UPDATE/DELETE deshabilitados por Postgres trigger).',
    'SYSTEM: Proceso finalizado. Cerrando navegador y liberando advisory lock.'
  ])

  return (
    <div style={{ background: '#050508', color: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      <main style={{ padding: '80px 0 100px', position: 'relative' }}>
        {/* Soft blue security ambient glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1000, height: 400, background: 'radial-gradient(circle 350px at 50% -70px, rgba(41,121,255,0.06) 0%, transparent 80%)', pointerEvents: 'none', zIndex: 0 }} />

        <div className="container" style={{ maxWidth: 840, position: 'relative', zIndex: 1, padding: '0 20px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: 32 }}>
            <Link href="/" style={{ color: '#8A8A9E', textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              ← Volver al inicio
            </Link>
          </div>

          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(41,121,255,0.08)', border: '1px solid rgba(41,121,255,0.2)', color: '#2979FF', padding: '6px 14px', borderRadius: 99, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              <span>🛡️ Infraestructura & Cumplimiento</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 18, lineHeight: 1.2 }}>
              Seguridad y Auditoría Forense de Scrapers
            </h1>
            
            <p style={{ fontSize: 16, color: '#8A8A9E', lineHeight: 1.6, maxWidth: 700 }}>
              DJADWEB-IA® opera bajo estándares de seguridad de grado bancario para garantizar la confidencialidad, trazabilidad y blindaje legal de cada automatización que interactúa con portales de gobierno.
            </p>
          </div>

          {/* Core Security Blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40, marginBottom: 64 }}>
            
            {/* Block 1 */}
            <div style={{ borderBottom: '1px solid #191926', paddingBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>1. Cumplimiento Legal e Integridad</h2>
              <p style={{ fontSize: 14.5, color: '#8A8A9E', lineHeight: 1.6 }}>
                Nuestra plataforma cuenta con una capa de auditoría forense inmutable (`compliance_audit_log`) construida directamente en nuestra base de datos. Cualquier trámite ejecutado por nuestros scrapers desatendidos genera un hash SHA-256 único de resguardo transaccional. Mediante triggers a nivel de base de datos de PostgreSQL, se bloquea cualquier intento de modificación o eliminación (`UPDATE` / `DELETE`) de los registros históricos.
              </p>
            </div>

            {/* Block 2 */}
            <div style={{ borderBottom: '1px solid #191926', paddingBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>2. Exclusión Mutua Concurrente (Advisory Locks)</h2>
              <p style={{ fontSize: 14.5, color: '#8A8A9E', lineHeight: 1.6 }}>
                Para evitar colisiones operacionales o envíos duplicados ante interrupciones de red o lambdas concurrentes, implementamos **Advisory Locks** a nivel de sesión en PostgreSQL. Esto asegura que solo exista un navegador headless interactuando con el SII, la TGR o el Poder Judicial por cada cuenta de ciudadano simultáneamente, garantizando la idempotencia absoluta del flujo de impuestos.
              </p>
            </div>

            {/* Block 3 */}
            <div style={{ borderBottom: '1px solid #191926', paddingBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>3. Navegación Headless Aislada e Identificación</h2>
              <p style={{ fontSize: 14.5, color: '#8A8A9E', lineHeight: 1.6 }}>
                Los scrapers basados en Playwright se ejecutan en contenedores independientes y aislados en la nube. Todas las solicitudes de API incorporan cabeceras seguras con `X-Correlation-ID` único, lo que permite un rastreo de extremo a extremo desde el trigger del usuario en el navegador hasta la confirmación de descarga del PDF en el portal estatal.
              </p>
            </div>

            {/* Block 4 */}
            <div style={{ paddingBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>4. Cifrado de Credenciales</h2>
              <p style={{ fontSize: 14.5, color: '#8A8A9E', lineHeight: 1.6 }}>
                Las llaves de acceso tributarias y tokens se encriptan simétricamente utilizando el algoritmo estándar **AES-256-GCM** en reposo. Las claves de desencriptación son gestionadas de forma aislada a través de secretos de entorno, inaccesibles para el frontend o terceras partes.
              </p>
            </div>

          </div>

          {/* Interactive Console logs for developers and auditors */}
          <div style={{ background: '#0B0B0F', border: '1px solid #191926', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>Terminal de Auditoría en Tiempo Real</h3>
                <p style={{ fontSize: 12, color: '#8A8A9E', marginTop: 2 }}>Ejemplo de telemetría y trazabilidad forense de un trámite F29 completado.</p>
              </div>
              <span style={{ fontSize: 11, color: '#00E676', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, background: '#00E676', borderRadius: '50%', boxShadow: '0 0 6px #00E676' }} />
                AUDIT LAYER ACTIVA
              </span>
            </div>

            <div style={{ background: '#050508', border: '1px solid #191926', borderRadius: 6, padding: '16px 20px', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7, color: '#8A8A9E', height: 280, overflowY: 'auto' }}>
              {scraperLogs.map((log, index) => {
                let color = '#8A8A9E'
                if (log.startsWith('SECURITY:')) color = '#2979FF'
                if (log.startsWith('AUDIT:')) color = '#00E676'
                if (log.startsWith('SII_PORTAL:')) color = '#FF6D00'
                if (log.startsWith('SYSTEM:')) color = '#FFFFFF'
                return (
                  <div key={index} style={{ color }}>
                    {log}
                  </div>
                )
              })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 11, color: '#5C5C70' }}>
              <span>ENCRIPTACIÓN: AES-256-GCM</span>
              <span>ESTABLECIDO VÍA TLS 1.3 SECURE PORTAL</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 64, borderTop: '1px solid #191926', paddingTop: 40 }}>
            <Link href="/" className="btn btn-orange" style={{ padding: '12px 28px' }}>
              Volver a la Página Principal
            </Link>
          </div>

        </div>
      </main>

      {/* Mini clean footer */}
      <footer style={{ borderTop: '1px solid #191926', padding: '32px 0', background: '#050508', textAlign: 'center', fontSize: 12, color: '#5C5C70' }}>
        <div className="container">
          <p>© {new Date().getFullYear()} DJADWEB-IA®. Todos los derechos reservados. Operado bajo jurisdicción de la República de Chile.</p>
        </div>
      </footer>
    </div>
  )
}
