'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AlertBadge from './AlertBadge'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser]         = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()

  // Auth listener
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Scroll-aware background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cerrar menú mobile al cambiar ruta
  useEffect(() => { setMenuOpen(false) }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navBg     = scrolled ? 'rgba(255, 255, 255, 0.96)' : 'transparent'
  const navShadow = scrolled ? '0 1px 12px rgba(15, 23, 42, 0.06)' : 'none'

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: navBg,
        borderBottom: scrolled ? '1px solid rgba(15, 23, 42, 0.06)' : '1px solid transparent',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: navShadow,
        transition: 'background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 20px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800, fontSize: 15 }}>
              T
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>
              Tramita
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="hidden-mobile">
            <NavLink href="/#como-funciona">Cómo funciona</NavLink>
            <NavLink href="/#precios">Precios</NavLink>
            <NavLink href="/seguridad">Seguridad</NavLink>

            {user ? (
              <>
                <Link href="/buscar"    className="btn btn-ghost btn-sm" style={{ borderColor: 'rgba(15,23,42,0.1)', color: '#475569', fontSize: 12.5, fontWeight: 700, borderRadius: 6 }}>Catálogo</Link>
                <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ borderColor: 'rgba(15,23,42,0.1)', color: '#475569', fontSize: 12.5, fontWeight: 700, borderRadius: 6 }}>Mi cuenta <AlertBadge /></Link>
                <button onClick={handleLogout} className="btn btn-primary btn-sm" style={{ background: '#0F172A', color: '#FFFFFF', borderRadius: 6, fontSize: 12.5, fontWeight: 700 }}>Salir</button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#475569',
                    textDecoration: 'none',
                    padding: '6px 12px',
                    borderRadius: 8,
                    transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#0F172A'
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#475569'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  Iniciar sesión
                </Link>
                <Link href="/auth/registro" className="btn btn-sm" style={{ background: '#2563EB', color: '#FFFFFF', borderRadius: 6, fontSize: 12.5, fontWeight: 700, padding: '8px 16px', boxShadow: '0 2px 4px rgba(37,99,235,0.1)' }}>
                  Empezar gratis →
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="show-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: menuOpen ? 'rgba(15,23,42,0.04)' : 'none',
              border: '1px solid',
              borderColor: menuOpen ? 'rgba(15,23,42,0.08)' : 'transparent',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 8,
              transition: 'all 0.15s',
              color: '#0F172A'
            }}
            aria-label="Menú"
            aria-expanded={menuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              {menuOpen
                ? <>
                    <line x1="3" y1="3" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="19" y1="3" x2="3"  y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </>
                : <>
                    <line x1="2" y1="6"  x2="20" y2="6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="2" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="2" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </>
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            padding: '16px 20px 24px',
            borderTop: '1px solid rgba(15,23,42,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.98)',
            animation: 'slideDown 0.2s ease',
          }}>
            <Link
              href="/#como-funciona"
              onClick={() => setMenuOpen(false)}
              style={{ fontWeight: 700, color: '#475569', textDecoration: 'none', padding: '8px 4px', fontSize: 13.5 }}
            >
              Cómo funciona
            </Link>
            <Link
              href="/#precios"
              onClick={() => setMenuOpen(false)}
              style={{ fontWeight: 700, color: '#475569', textDecoration: 'none', padding: '8px 4px', fontSize: 13.5 }}
            >
              Precios
            </Link>
            <Link
              href="/seguridad"
              onClick={() => setMenuOpen(false)}
              style={{ fontWeight: 700, color: '#475569', textDecoration: 'none', padding: '8px 4px', fontSize: 13.5 }}
            >
              Seguridad
            </Link>
            <div style={{ height: 1, background: 'rgba(15,23,42,0.06)', margin: '4px 0' }} />
            {user ? (
              <>
                <Link href="/buscar"    onClick={() => setMenuOpen(false)} className="btn btn-ghost" style={{ borderColor: 'rgba(15,23,42,0.1)', color: '#475569' }}>Catálogo</Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn btn-ghost" style={{ borderColor: 'rgba(15,23,42,0.1)', color: '#475569' }}>Mi cuenta <AlertBadge /></Link>
                <button onClick={handleLogout} className="btn btn-primary" style={{ background: '#0F172A', color: '#FFFFFF' }}>Salir</button>
              </>
            ) : (
              <>
                <Link href="/auth/login"    onClick={() => setMenuOpen(false)} className="btn btn-ghost" style={{ borderColor: 'rgba(15,23,42,0.1)', color: '#475569' }}>Iniciar sesión</Link>
                <Link href="/auth/registro" onClick={() => setMenuOpen(false)} className="btn" style={{ background: '#2563EB', color: '#FFFFFF', textAlign: 'center' }}>
                  Empezar gratis →
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  )
}

// ── Subcomponente link de navegación ─────────────────────────────────────────
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#475569',
        textDecoration: 'none',
        padding: '6px 12px',
        borderRadius: 8,
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = '#0F172A'
        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = '#475569'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </Link>
  )
}
  )
}
