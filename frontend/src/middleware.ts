import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Renovar sesión (mantiene el token fresco)
  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Rutas protegidas → redirigir a login
  const protectedRoutes = ['/dashboard', '/buscar']
  const isProtected = protectedRoutes.some(r => path.startsWith(r))
  if (!session && isProtected) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  // Páginas de auth → redirigir al dashboard si ya está logueado
  const authRoutes = ['/auth/login', '/auth/registro']
  const isAuth = authRoutes.some(r => path.startsWith(r))
  if (session && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/buscar/:path*',
    '/auth/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|ico|webp)).*)',
  ],
}
