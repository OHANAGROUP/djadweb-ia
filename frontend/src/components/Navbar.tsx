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

  const navBg     = scrolled ? 'rgba(245,245,240,0.98)' : 'rgba(245,245,240,0.80)'
  const navShadow = scrolled ? '0 1px 24px rgba(10,10,14,0.08)' : 'none'

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: navBg,
        borderBottom: scrolled ? '1px solid var(--gray-200)' : '1px solid transparent',
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img
              src="/djadwebia_logo_final.png"
              alt="DEJAWEBIAR®"
              style={{ height: 34, width: 'auto', display: 'block', transition: 'opacity 0.15s' }}
            />
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="hidden-mobile">
            <NavLink href="/#como-funciona">Cómo funciona</NavLink>
            <NavLink href="/#precios">Precios</NavLink>

            {user ? (
              <>
                <Link href="/buscar"    className="btn btn-ghost btn-sm">Buscar</Link>
                <Link href="/dashboard" className="btn btn-ghost btn-sm">Mi cuenta <AlertBadge /></Link>
                <button onClick={handleLogout} className="btn btn-primary btn-sm">Salir</button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: 'var(--gray-600)',
                    textDecoration: 'none',
                    padding: '6px 12px',
                    borderRadius: 8,
                    transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--brand-black)'
                    e.currentTarget.style.background = 'rgba(10,10,14,0.04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--gray-600)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  Iniciar sesión
                </Link>
                <Link href="/auth/registro" className="btn btn-primary btn-sm">
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
              background: menuOpen ? 'var(--gray-100)' : 'none',
              border: '1px solid',
              borderColor: menuOpen ? 'var(--gray-300)' : 'transparent',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 8,
              transition: 'all 0.15s',
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
            borderTop: '1px solid var(--gray-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'rgba(245,245,240,0.99)',
            animation: 'slideDown 0.2s ease',
          }}>
            <Link
              href="/#como-funciona"
              onClick={() => setMenuOpen(false)}
              style={{ fontWeight: 600, color: 'var(--gray-700)', textDecoration: 'none', padding: '8px 4px', fontSize: 14 }}
            >
              Cómo funciona
            </Link>
            <Link
              href="/#precios"
              onClick={() => setMenuOpen(false)}
              style={{ fontWeight: 600, color: 'var(--gray-700)', textDecoration: 'none', padding: '8px 4px', fontSize: 14 }}
            >
              Precios
            </Link>
            <div style={{ height: 1, background: 'var(--gray-200)', margin: '4px 0' }} />
            {user ? (
              <>
                <Link href="/buscar"    onClick={() => setMenuOpen(false)} className="btn btn-ghost">Buscar</Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn btn-ghost">Mi cuenta <AlertBadge /></Link>
                <button onClick={handleLogout} className="btn btn-primary">Salir</button>
              </>
            ) : (
              <>
                <Link href="/auth/login"    onClick={() => setMenuOpen(false)} className="btn btn-ghost">Iniciar sesión</Link>
                <Link href="/auth/registro" onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>
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
        fontSize: 13.5,
        fontWeight: 600,
        color: 'var(--gray-600)',
        textDecoration: 'none',
        padding: '6px 12px',
        borderRadius: 8,
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--brand-black)'
        e.currentTarget.style.background = 'rgba(10,10,14,0.04)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--gray-600)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </Link>
  )
}
