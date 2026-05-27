'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function SeguridadPage() {
  const [scraperLogs] = useState<string[]>([
    'SYSTEM: Entorno transaccional seguro inicializado.',
    'SECURITY: Protocolo de encriptación bancaria AES-256 activo.',
    'AUDIT: Registro de trazabilidad y auditoría de Supabase en línea.',
    'DB_LOCK: Solicitando bloqueo de sesión (advisory lock) en PostgreSQL para proceso 76192...',
    'DB_LOCK: Lock obtenido exitosamente. Previniendo colisiones o envíos concurrentes.',
    'STATE_MACHINE: Hash SHA-256 de estado transaccional verificado.',
    'STATE_MACHINE: Transición legal de estado validada por Grafo Determinista (inicial -> login_sii).',
    'BROWSER: Iniciando instancia de navegador headless aislada en la nube.',
    'BROWSER: Argumentos aplicados para contenedor seguro: --no-sandbox.',
    'CORRELATION: X-Correlation-ID: 7c2a9a2d-20be-4573-b26a-939e144f8ea0 generado.',
    'SII_PORTAL: Estableciendo sesión cifrada TLS 1.3 con sii.cl...',
    'SII_PORTAL: Formulario F29 cargado exitosamente. Período: 05-2026.',
    'SII_PORTAL: Ejecutando verificación del Asistente RCV para compras y ventas...',
    'SII_PORTAL: Total a pagar calculado = $0 CLP (IVA sin movimiento).',
    'SII_PORTAL: Enviando declaración de forma segura en portal SII...',
    'SII_PORTAL: Comprobante oficial de F29 recibido. Folio: 92831.',
    'COMPLIANCE_LOG: Guardando traza inmutable en base de datos.',
    'COMPLIANCE_LOG: Registro bloqueado (operaciones de actualización/eliminación deshabilitadas por trigger).',
    'SYSTEM: Navegador cerrado de forma segura. Advisory lock liberado.'
  ])

  return (
    <div style={{ background: '#FFFFFF', color: '#0F172A', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'sans-serif' }}>
      <Navbar />

      <main style={{ padding: '80px 0 100px', position: 'relative', background: 'radial-gradient(1000px circle at 50% -100px, rgba(37,99,235,0.02) 0%, transparent 80%)' }}>
        
        <div className="container" style={{ maxWidth: 840, position: 'relative', zIndex: 1, padding: '0 20px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: 32 }}>
            <Link href="/" style={{ color: '#475569', textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              ← Volver al inicio
            </Link>
          </div>

          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', color: '#2563EB', padding: '6px 14px', borderRadius: 99, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              <span>🛡️ Seguridad & Cumplimiento Técnico</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 18, lineHeight: 1.2, color: '#0F172A' }}>
              Seguridad y Auditoría Forense de Procesos
            </h1>
            
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6, maxWidth: 700 }}>
              Tramita opera bajo estrictos protocolos de protección de datos para garantizar la confidencialidad, trazabilidad y blindaje transaccional de cada interacción con portales del Estado.
            </p>
          </div>

          {/* Core Security Blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40, marginBottom: 64 }}>
            
            {/* Block 1 */}
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>1. Cumplimiento e Integridad Inmutable</h2>
              <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6 }}>
                Nuestra infraestructura incorpora una capa de auditoría inmutable directamente en la base de datos de producción (`compliance_audit_log`). Cada trámite ejecutado por los automatizadores desatendidos genera un hash SHA-256 único de integridad transaccional. Triggers a nivel de base de datos bloquean de forma estricta cualquier intento posterior de modificación o eliminación (`UPDATE` / `DELETE`), garantizando reportes auditables e históricos intocables.
              </p>
            </div>

            {/* Block 2 */}
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>2. Exclusión Mutua Concurrente (Advisory Locks)</h2>
              <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6 }}>
                Para evitar ejecuciones concurrentes o envíos accidentales duplicados al SII o a Tesorería ante micro-cortes de red, implementamos **Advisory Locks** de sesión. Esto asegura que exista un único navegador headless interactuando con las instituciones públicas por cada cuenta de contribuyente a la vez, garantizando la idempotencia del flujo contable.
              </p>
            </div>

            {/* Block 3 */}
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>3. Navegadores Headless Aislados y Trazabilidad</h2>
              <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6 }}>
                Los automatizadores de Playwright se ejecutan de manera aislada en contenedores independientes en la nube. Cada petición genera y arrastra una cabecera de trazabilidad `X-Correlation-ID` que permite el rastreo continuo desde la acción inicial del usuario hasta la obtención del PDF oficial final emitido por el Estado.
              </p>
            </div>

            {/* Block 4 */}
            <div style={{ paddingBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>4. Cifrado Avanzado de Llaves de Acceso</h2>
              <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6 }}>
                Las credenciales tributarias de los usuarios se almacenan encriptadas simétricamente utilizando el estándar de la industria **AES-256-GCM** en reposo. Las claves criptográficas de descifrado se administran a través de secretos de entorno seguros y aislados de las interfaces de usuario.
              </p>
            </div>

          </div>

          {/* Interactive Console logs for developers and auditors */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 10px 30px rgba(15,23,42,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10, textAlign: 'left' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Consola de Auditoría de Procesos</h3>
                <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Ejemplo del flujo de trazabilidad y logs forenses de un trámite F29 completado.</p>
              </div>
              <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, background: '#16A34A', borderRadius: '50%', boxShadow: '0 0 6px #16A34A' }} />
                AUDITORÍA ACTIVA
              </span>
            </div>

            <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 6, padding: '16px 20px', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7, color: '#94A3B8', height: 280, overflowY: 'auto', textAlign: 'left' }}>
              {scraperLogs.map((log, index) => {
                let color = '#94A3B8'
                if (log.startsWith('SECURITY:')) color = '#38BDF8'
                if (log.startsWith('AUDIT:')) color = '#34D399'
                if (log.startsWith('SII_PORTAL:')) color = '#FB923C'
                if (log.startsWith('SYSTEM:')) color = '#FFFFFF'
                return (
                  <div key={index} style={{ color }}>
                    {log}
                  </div>
                )
              })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 11, color: '#64748B' }}>
              <span>MÉTODO DE CIFRADO: AES-256-GCM</span>
              <span>CONEXIÓN CON SII: TLS 1.3 SECURE PORTAL</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 64, borderTop: '1px solid #E2E8F0', paddingTop: 40 }}>
            <Link href="/" className="btn" style={{ background: '#2563EB', color: '#FFFFFF', padding: '12px 32px', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 6px rgba(37,99,235,0.15)' }}>
              Volver a la Página Principal
            </Link>
          </div>

        </div>
      </main>

      {/* Footer corporativo chileno */}
      <footer style={{ borderTop: '1px solid #E2E8F0', padding: '48px 0', background: '#F8FAFC', fontSize: 12, color: '#475569' }}>
        <div className="container" style={{ padding: '0 20px', maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <p>© {new Date().getFullYear()} DW Trámites y Tecnología SpA. RUT: 76.982.104-K. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/terminos" style={{ color: '#475569', textDecoration: 'none' }}>Términos de servicio</Link>
            <Link href="/privacidad" style={{ color: '#475569', textDecoration: 'none' }}>Política de privacidad</Link>
            <Link href="/" style={{ color: '#475569', textDecoration: 'none' }}>Inicio</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
