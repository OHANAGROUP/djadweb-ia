/**
 * Cliente Supabase para uso en el NAVEGADOR (Client Components).
 * Para Server Components y API routes usa supabase-server.ts
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
