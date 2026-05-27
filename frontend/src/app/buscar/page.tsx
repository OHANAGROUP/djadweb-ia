'use client'

import Navbar from '@/components/Navbar'
import { getAllTramites } from '@/lib/registry/tramites'
import Link from 'next/link'
import { useState } from 'react'

const TRAMITES = getAllTramites()

const CATEGORIES = [
  { id: 'empresa', label: 'Empresa y Emprendimiento', emoji: '🏢' },
  { id: 'tributario', label: 'Tributario (SII y TGR)', emoji: '📄' },
  { id: 'laboral', label: 'Laboral y Trabajadores', emoji: '👷' },
  { id: 'legal', label: 'Legal y Judicial', emoji: '⚖️' },
  { id: 'municipal', label: 'Municipalidades', emoji: '🏛️' },
]

export default function CatalogoPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTramites = TRAMITES.filter(t => 
    t.goal?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderTramites = (categoryId: string) => {
    const list = filteredTramites.filter(t => t.category === categoryId)
    if (list.length === 0) return null

    return (
      <div key={categoryId} style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          {CATEGORIES.find(c => c.id === categoryId)?.emoji} 
          {CATEGORIES.find(c => c.id === categoryId)?.label}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {list.map(t => (
            <div key={t.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span className="badge badge-blue">{t.institution}</span>
                {t.monetizationTier === 'pro' ? (
                  <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>⭐ PRO</span>
                ) : (
                  <span className="badge" style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' }}>Gratis</span>
                )}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{t.goal}</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', flex: 1, marginBottom: 16, lineHeight: 1.5 }}>{t.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-200)', paddingTop: 16, marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Fricción:</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ 
                        width: 8, height: 8, borderRadius: '50%', 
                        background: i < Math.ceil((t.frictionScore || 0) / 2) ? (t.frictionScore! >= 8 ? '#EF4444' : t.frictionScore! >= 5 ? '#F59E0B' : '#10B981') : '#E5E7EB' 
                      }} />
                    ))}
                  </div>
                </div>
                <Link href={`/dashboard?tramite=${t.id}`} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: 12 }}>
                  Iniciar Guía →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px', maxWidth: 1000 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: 12 }}>
            Catálogo Nacional de Trámites
          </h1>
          <p style={{ fontSize: 16, color: 'var(--gray-500)', maxWidth: 600, margin: '0 auto' }}>
            Encuentra guías paso a paso para los trámites más engorrosos del Estado chileno. 
            Tramita te acompaña para que no cometas errores costosos.
          </p>
        </div>

        <div style={{ marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="🔍 Buscar un trámite (ej: Término de Giro, SII, Patente)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '16px 20px', fontSize: 16, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          />
        </div>

        <div>
          {CATEGORIES.map(c => renderTramites(c.id))}
          {filteredTramites.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No encontramos trámites con ese término.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
