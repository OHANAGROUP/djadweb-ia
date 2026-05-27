/**
 * /api/credenciales — Gestión de credenciales cifradas de portales gubernamentales.
 *
 * POST  /api/credenciales  → Cifra y guarda (o actualiza) credenciales SII/TGR.
 * DELETE /api/credenciales  → Revocación suave via función SQL revocar_credenciales().
 *
 * SEGURIDAD CRÍTICA:
 *  - Nunca se loguea body, RUT, username ni password.
 *  - Las credenciales nunca se retornan al frontend (ni en respuesta de éxito).
 *  - El cifrado ocurre en servidor ANTES de cualquier llamada a Supabase.
 *  - Solo service_role puede interactuar con la tabla (via createAdminClient).
 *  - La revocación es suave (revoked_at): no hay DELETE físico de registros.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase-server'
import { encrypt } from '@/lib/crypto'

// ── Helpers ───────────────────────────────────────────────────────────────────

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  // Usamos createClient (anon) para validar la sesión del usuario desde cookies
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

function sanitizeProvider(raw: unknown): 'sii' | 'tgr' | null {
  if (raw === 'sii' || raw === 'tgr') return raw
  return null
}

function sanitizeRut(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const rut = raw.replace(/\./g, '').toUpperCase().trim()
  if (!/^[0-9]+-[0-9K]$/.test(rut)) return null
  return rut
}

// ── POST — Guardar credenciales ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req)
  if (!userId) return errorResponse('No autenticado.', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return errorResponse('Cuerpo de solicitud inválido.', 400)
  }

  if (typeof body !== 'object' || body === null) {
    return errorResponse('Parámetros requeridos: provider, username, password.', 400)
  }

  const { provider: rawProvider, username: rawUsername, password: rawPassword } = body as Record<string, unknown>

  const provider = sanitizeProvider(rawProvider)
  if (!provider) {
    return errorResponse('provider debe ser "sii" o "tgr".', 400)
  }

  const username = sanitizeRut(rawUsername)
  if (!username) {
    return errorResponse('username (RUT) inválido. Use formato 12345678-9.', 400)
  }

  if (typeof rawPassword !== 'string' || rawPassword.length < 4) {
    return errorResponse('password inválida.', 400)
  }

  // Cifrar ANTES de cualquier operación de base de datos
  let encrypted: ReturnType<typeof encrypt>
  try {
    encrypted = encrypt(rawPassword)
  } catch (err: any) {
    // No loguear el password, solo el mensaje de error del módulo crypto
    console.error('[credenciales] Error de cifrado:', err.message)
    return errorResponse('Error al procesar las credenciales. Verifica la configuración del servidor.', 500)
  }

  // Upsert via service_role (bypassa RLS para poder hacer ON CONFLICT UPDATE)
  const supabaseAdmin = createAdminClient()

  const { error: upsertError } = await supabaseAdmin
    .from('user_credentials')
    .upsert(
      {
        user_id:            userId,
        provider,
        username,                              // RUT en cleartext (no sensible por sí solo)
        password_encrypted: encrypted.ciphertext,
        encryption_version: encrypted.version,
        revoked_at:         null,              // Re-activar si estaba revocada
        updated_at:         new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' }
    )

  if (upsertError) {
    console.error('[credenciales] Error al guardar:', upsertError.code)
    return errorResponse('No se pudieron guardar las credenciales. Intenta nuevamente.', 500)
  }

  // Registrar en audit log (acción 'created' o 'updated')
  // No incluimos los datos cifrados en el log — solo metadatos
  await supabaseAdmin.from('credential_audit_log').insert({
    user_id:      userId,
    provider,
    action:       'created',
    performed_by: 'user',
  }).then(({ error }) => {
    if (error) console.warn('[credenciales] Audit log insert falló:', error.code)
  })

  return NextResponse.json(
    { ok: true, provider, message: 'Credenciales guardadas correctamente.' },
    { status: 200 }
  )
}

// ── DELETE — Revocar credenciales ─────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req)
  if (!userId) return errorResponse('No autenticado.', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return errorResponse('Cuerpo de solicitud inválido.', 400)
  }

  if (typeof body !== 'object' || body === null) {
    return errorResponse('Parámetro requerido: provider.', 400)
  }

  const { provider: rawProvider } = body as Record<string, unknown>
  const provider = sanitizeProvider(rawProvider)
  if (!provider) {
    return errorResponse('provider debe ser "sii" o "tgr".', 400)
  }

  const supabaseAdmin = createAdminClient()

  // Invocar la función SQL con SECURITY DEFINER — solo service_role puede llamarla
  const { error: rpcError } = await supabaseAdmin.rpc('revocar_credenciales', {
    p_user_id: userId,
    p_provider: provider,
  })

  if (rpcError) {
    console.error('[credenciales] Error al revocar:', rpcError.code)
    return errorResponse('No se pudieron revocar las credenciales. Intenta nuevamente.', 500)
  }

  return NextResponse.json(
    { ok: true, provider, message: 'Credenciales revocadas correctamente.' },
    { status: 200 }
  )
}
