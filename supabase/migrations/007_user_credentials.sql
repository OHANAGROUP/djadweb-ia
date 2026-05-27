-- ============================================================
-- Tramita — Migración 007: user_credentials
-- Infraestructura segura para credenciales cifradas de portales
-- gubernamentales (SII, TGR). Prerequisito de Fase 3.
--
-- ⚠️  SEGURIDAD CRÍTICA:
--   - password_encrypted NUNCA almacena plaintext.
--   - El cifrado (AES-256-GCM) ocurre en el servidor
--     ANTES de insertar. Supabase solo ve ciphertext.
--   - RLS impide que cualquier usuario lea datos ajenos.
--   - revoked_at hace revocación auditada sin borrado físico.
-- ============================================================

BEGIN;

-- ── 1. TABLA PRINCIPAL ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  -- Portal al que corresponden las credenciales
  provider             text NOT NULL
                         CHECK (provider IN ('sii', 'tgr')),

  -- RUT o username del portal (cleartext, no sensible por sí solo)
  username             text NOT NULL,

  -- Ciphertext: AES-256-GCM → base64(iv:ciphertext:authTag)
  -- Nunca almacenar plaintext aquí.
  password_encrypted   text NOT NULL,

  -- Versión del esquema de cifrado (permite rotación de clave sin
  -- migrar datos: desciframos con la clave vieja, re-ciframos con la nueva)
  encryption_version   integer NOT NULL DEFAULT 1,

  -- Timestamps
  created_at           timestamptz DEFAULT now() NOT NULL,
  updated_at           timestamptz DEFAULT now() NOT NULL,

  -- Revocación suave: seteado cuando el usuario elimina credenciales.
  -- Los jobs activos deben verificar este campo antes de ejecutar.
  revoked_at           timestamptz,

  -- Unicidad: un usuario solo puede tener una credencial activa por portal
  CONSTRAINT user_credentials_user_provider_unique
    UNIQUE (user_id, provider)
);

COMMENT ON TABLE  public.user_credentials IS
  'Credenciales cifradas AES-256-GCM para portales gubernamentales. Nunca contiene plaintext.';
COMMENT ON COLUMN public.user_credentials.password_encrypted IS
  'Ciphertext base64 en formato iv:ciphertext:authTag (AES-256-GCM). IV único por registro.';
COMMENT ON COLUMN public.user_credentials.encryption_version IS
  'Versión del esquema de cifrado. Permite rotación de clave: descifrar con v_old, re-cifrar con v_new.';
COMMENT ON COLUMN public.user_credentials.revoked_at IS
  'NULL = activa. Seteado = revocada. Los jobs DEBEN abortar si revoked_at IS NOT NULL.';

-- ── 2. ÍNDICES ────────────────────────────────────────────────
-- Lookup rápido por usuario (dashboard, jobs)
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id
  ON public.user_credentials (user_id, provider);

-- Detectar credenciales revocadas pendientes de limpieza
CREATE INDEX IF NOT EXISTS idx_user_credentials_revoked
  ON public.user_credentials (revoked_at)
  WHERE revoked_at IS NOT NULL;

-- ── 3. ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- Un usuario solo puede ver sus propias credenciales
CREATE POLICY "user_credentials_select_own"
  ON public.user_credentials FOR SELECT
  USING (auth.uid() = user_id);

-- Un usuario solo puede insertar sus propias credenciales
CREATE POLICY "user_credentials_insert_own"
  ON public.user_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Un usuario solo puede actualizar sus propias credenciales
CREATE POLICY "user_credentials_update_own"
  ON public.user_credentials FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Borrado físico prohibido via RLS: usar revoked_at en su lugar.
-- Solo el admin (service_role) puede hacer DELETE para limpieza GDPR.
-- (No se declara política DELETE para rol authenticated.)

-- ── 4. TRIGGER: updated_at automático ────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_credentials_updated_at ON public.user_credentials;
CREATE TRIGGER trg_user_credentials_updated_at
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. AUDIT LOG DE CREDENCIALES ─────────────────────────────
-- Registro inmutable de cada operación sobre credenciales.
-- Importante para cumplimiento y detección de anomalías.
CREATE TABLE IF NOT EXISTS public.credential_audit_log (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  credential_id   uuid REFERENCES public.user_credentials ON DELETE SET NULL,
  user_id         uuid NOT NULL,
  action          text NOT NULL
                    CHECK (action IN ('created', 'updated', 'revoked', 'decrypted', 'rotation_started', 'rotation_completed')),
  provider        text NOT NULL,
  performed_by    text NOT NULL DEFAULT 'user',  -- 'user' | 'system' | 'admin'
  ip_address      inet,
  user_agent      text,
  metadata        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.credential_audit_log IS
  'Audit inmutable de operaciones sobre credenciales de portales. No modificar registros existentes.';

-- Solo lectura para el propio usuario; escritura solo por service_role
ALTER TABLE public.credential_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credential_audit_select_own"
  ON public.credential_audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Nadie puede insertar directamente desde el cliente (solo service_role via server)

-- ── 6. FUNCIÓN HELPER: revocar credenciales ───────────────────
-- Llama a esta función desde el servidor (service_role) al procesar
-- el botón "Eliminar credenciales" del dashboard.
CREATE OR REPLACE FUNCTION public.revocar_credenciales(
  p_user_id uuid,
  p_provider text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- ejecuta como owner (postgres), no como caller
SET search_path = public
AS $$
BEGIN
  -- Marcar como revocada
  UPDATE public.user_credentials
  SET revoked_at = now()
  WHERE user_id = p_user_id
    AND provider = p_provider
    AND revoked_at IS NULL;

  -- Registrar en audit log
  INSERT INTO public.credential_audit_log
    (user_id, provider, action, performed_by)
  VALUES
    (p_user_id, p_provider, 'revoked', 'user');
END;
$$;

REVOKE ALL ON FUNCTION public.revocar_credenciales FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revocar_credenciales TO service_role;

COMMIT;
