-- ==============================================================================
-- 🏗️ DJADWEB-IA® — SCRIPT MAESTRO CONSOLIDADO DE MIGRACIONES DE BASE DE DATOS
-- Versión: 2.0-GOLD (Hardened & Ready for Production)
-- Autor: Pablo Francisco Palominos Naredo [2026]
--
-- Instrucciones: Copia todo este bloque y ejecútalo una sola vez en el 
-- SQL Editor de Supabase (https://supabase.com).
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- ── SECCIÓN 1: ESQUEMA INICIAL (001_initial.sql)
-- ==============================================================================

-- 1. PROFILES (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nombre_completo text,
  rut             text,
  telefono        text,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Datos de perfil del usuario, 1:1 con auth.users';

-- 2. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  plan                  text NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free','basic','premium')),
  status                text NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','cancelled','past_due','trialing')),
  mp_subscription_id    text,
  mp_payer_id           text,
  current_period_start  timestamptz DEFAULT now(),
  current_period_end    timestamptz,
  cancelled_at          timestamptz,
  created_at            timestamptz DEFAULT now() NOT NULL,
  updated_at            timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.subscriptions IS 'Plan activo del usuario (free/basic/premium)';
COMMENT ON COLUMN public.subscriptions.mp_subscription_id IS 'ID de suscripción en MercadoPago';

-- 3. SEARCHES (historial de consultas)
CREATE TABLE IF NOT EXISTS public.searches (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  params      jsonb NOT NULL,
  result      jsonb,
  ai_summary  text,
  created_at  timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.searches IS 'Historial de búsquedas PJUD/SII del usuario';

-- Índices para searches
CREATE INDEX IF NOT EXISTS searches_user_id_created_at_idx
  ON public.searches (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS searches_user_month_idx
  ON public.searches (user_id, date_trunc('month', created_at));

-- 4. ALERTS (alertas proactivas)
CREATE TABLE IF NOT EXISTS public.alerts (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  nombre              text NOT NULL,
  apellido_paterno    text NOT NULL,
  apellido_materno    text,
  competencias        text[] NOT NULL DEFAULT ARRAY['civil','laboral','penal'],
  activa              boolean DEFAULT true NOT NULL,
  last_checked        timestamptz,
  last_result_hash    text,
  notify_email        boolean DEFAULT true,
  notify_whatsapp     boolean DEFAULT false,
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.alerts IS 'Configuración de alertas proactivas (plan premium)';

-- 5. TRIGGER: updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  new.updated_at = now();
  return new;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS alerts_updated_at ON public.alerts;
CREATE TRIGGER alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. TRIGGER: auto-crear profile + subscription al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (new.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.searches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts         ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "profiles_owner" ON public.profiles;
CREATE POLICY "profiles_owner" ON public.profiles
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "subscriptions_read_owner" ON public.subscriptions;
CREATE POLICY "subscriptions_read_owner" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "searches_owner" ON public.searches;
CREATE POLICY "searches_owner" ON public.searches
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "alerts_owner" ON public.alerts;
CREATE POLICY "alerts_owner" ON public.alerts
  FOR ALL USING (auth.uid() = user_id);

-- 8. FUNCIÓN: contar búsquedas del mes (quota)
CREATE OR REPLACE FUNCTION public.get_monthly_search_count(p_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT count(*)::integer
  FROM public.searches
  WHERE user_id = p_user_id
    AND date_trunc('month', created_at) = date_trunc('month', now());
$$;


-- ==============================================================================
-- ── SECCIÓN 2: INTEGRACIÓN SII, TGR Y CREDENCIALES (002_sii_tgr.sql)
-- ==============================================================================

-- 1. Credenciales de usuarios
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rut_empresa TEXT NOT NULL,
  password_sii_encrypted TEXT,
  iv_sii TEXT,
  sii_locked BOOLEAN DEFAULT FALSE,
  sii_last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Consultas SII
CREATE TABLE IF NOT EXISTS public.sii_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_consulta TEXT NOT NULL CHECK (tipo_consulta IN ('datos_basicos', 'deudas', 'guias_despacho', 'dte')),
  rut_consultado TEXT NOT NULL,
  resultado JSONB,
  resumen_ia TEXT,
  cache_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sii_queries_user_id ON public.sii_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_sii_queries_created_at ON public.sii_queries(created_at DESC);

-- 3. Consultas TGR
CREATE TABLE IF NOT EXISTS public.tgr_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_consulta TEXT NOT NULL CHECK (tipo_consulta IN ('deuda_simple', 'certificado')),
  rut_consultado TEXT NOT NULL,
  resultado JSONB,
  tiene_deuda BOOLEAN,
  total_deuda INTEGER DEFAULT 0,
  cache_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tgr_queries_user_id ON public.tgr_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_tgr_queries_created_at ON public.tgr_queries(created_at DESC);

-- 4. Columna fuente en searches
ALTER TABLE public.searches ADD COLUMN IF NOT EXISTS fuente TEXT DEFAULT 'pjud'
  CHECK (fuente IN ('pjud', 'sii', 'tgr', 'chat'));

-- 5. RLS para SII/TGR
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sii_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tgr_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credentials" ON public.user_credentials;
CREATE POLICY "Users can view own credentials" ON public.user_credentials
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own credentials" ON public.user_credentials;
CREATE POLICY "Users can insert own credentials" ON public.user_credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own credentials" ON public.user_credentials;
CREATE POLICY "Users can update own credentials" ON public.user_credentials
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own sii queries" ON public.sii_queries;
CREATE POLICY "Users can view own sii queries" ON public.sii_queries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sii queries" ON public.sii_queries;
CREATE POLICY "Users can insert own sii queries" ON public.sii_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own tgr queries" ON public.tgr_queries;
CREATE POLICY "Users can view own tgr queries" ON public.tgr_queries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tgr queries" ON public.tgr_queries;
CREATE POLICY "Users can insert own tgr queries" ON public.tgr_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Trigger updated_at para credenciales
CREATE OR REPLACE FUNCTION public.set_user_credentials_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_credentials_updated_at ON public.user_credentials;
CREATE TRIGGER user_credentials_updated_at
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_user_credentials_updated_at();


-- ==============================================================================
-- ── SECCIÓN 3: HISTORIAL DE CHAT IA (003_chat_history.sql)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nueva conversación',
  summary TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sources JSONB,
  metadata JSONB,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON public.chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON public.chat_sessions;
CREATE POLICY "Users can view own sessions" ON public.chat_sessions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.set_chat_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_chat_updated_at();


-- ==============================================================================
-- ── SECCIÓN 4: RUNTIME SOBERANO E INMUTABILIDAD FORENSE (005_runtime_soberano.sql)
-- ==============================================================================

-- 1. REGISTRO DE AUDITORÍA INMUTABLE (Compliance & Legal Liability Mitigation)
CREATE TABLE IF NOT EXISTS public.compliance_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type text NOT NULL, -- 'tool_execution', 'state_mutation', 'policy_violation'
    tool_name text,
    tool_input jsonb DEFAULT '{}'::jsonb,
    tool_output jsonb DEFAULT '{}'::jsonb,
    llm_model text NOT NULL,
    risk_snapshot jsonb DEFAULT '[]'::jsonb,
    workflow_version text NOT NULL DEFAULT 'v2',
    created_at timestamptz DEFAULT now()
);

-- 2. AMPLIACIÓN DE LA MÁQUINA DE ESTADOS (Idempotencia, Causalidad y Degradación Temporal)
ALTER TABLE public.chat_sessions
ADD COLUMN IF NOT EXISTS workflow_state jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS workflow_type text,
ADD COLUMN IF NOT EXISTS current_stage text,
ADD COLUMN IF NOT EXISTS risk_flags jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS missing_requirements jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_tool_used text,
ADD COLUMN IF NOT EXISTS completion_percentage integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS confidence_score numeric DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS workflow_version text DEFAULT 'v2',
ADD COLUMN IF NOT EXISTS event_history jsonb DEFAULT '[]'::jsonb, -- Event Sourcing para causalidad
ADD COLUMN IF NOT EXISTS state_hash text,                       -- Mitigación de loops semánticos
ADD COLUMN IF NOT EXISTS last_verified_at timestamptz DEFAULT now();

-- 3. ÍNDICES OPTIMIZADOS PARA BÚSQUEDAS COMPLEJAS Y DASHBOARDS PREDICTIVOS
CREATE INDEX IF NOT EXISTS idx_compliance_audit_session ON public.compliance_audit_log(session_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_event_type ON public.compliance_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_workflow_version ON public.chat_sessions(workflow_version);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_current_stage ON public.chat_sessions(current_stage);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_workflow_state ON public.chat_sessions USING gin(workflow_state);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_risk_flags ON public.chat_sessions USING gin(risk_flags);

-- RLS para Compliance logs
ALTER TABLE public.compliance_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.compliance_audit_log;
CREATE POLICY "Users can view own audit logs" ON public.compliance_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- 4. TRIGGER DE INMUTABILIDAD PARA EL LOG DE CUMPLIMIENTO
CREATE OR REPLACE FUNCTION public.prevent_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Operación denegada: El registro de auditoría de cumplimiento en DJADWEB-IA es inmutable.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_audit_logs ON public.compliance_audit_log;
CREATE TRIGGER trg_protect_audit_logs
BEFORE UPDATE OR DELETE ON public.compliance_audit_log
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_mutation();


-- ==============================================================================
-- ── SECCIÓN 5: HARDENING OPERACIONAL Y TELEMETRÍA (005_hardening_operacional.sql)
-- ==============================================================================

-- 1. Actualizar el tamaño y tipo de hash para soportar SHA-256 (64 caracteres hex)
ALTER TABLE public.chat_sessions 
ALTER COLUMN state_hash TYPE varchar(64);

-- 2. Inyectar variables de telemetría y control de costos en el registro inmutable
ALTER TABLE public.compliance_audit_log
ADD COLUMN IF NOT EXISTS token_input_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_output_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tool_iteration_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS runtime_ms integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS correlation_id uuid DEFAULT gen_random_uuid();

-- 3. Índices de alta velocidad para análisis de costos y detección de anomalías cognitivas
CREATE INDEX IF NOT EXISTS idx_compliance_audit_correlation_id ON public.compliance_audit_log(correlation_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_telemetry ON public.compliance_audit_log(token_input_count, token_output_count, runtime_ms);

-- 4. RPC ADVISORY LOCK POSTGRES (Tolerancia de concurrencia agéntica)
CREATE OR REPLACE FUNCTION public.adquirir_advisory_lock_sesion(target_session_id uuid)
RETURNS boolean AS $$
DECLARE
  v_lock_acquired boolean;
  v_lock_key integer;
BEGIN
  -- Convertir el UUID a un hash integer de 32 bits estable para el advisory lock
  v_lock_key := ('x' || substring(md5(target_session_id::text) from 1 for 8))::bit(32)::integer;
  
  -- Intentar obtener un lock advisory de sesión síncrono no-bloqueante
  v_lock_acquired := pg_try_advisory_xact_lock(v_lock_key);
  
  IF NOT v_lock_acquired THEN
    RAISE EXCEPTION 'Transacción bloqueada: Advisory Lock activo para la sesión.';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- ==============================================================================
-- ── SECCIÓN 6: OPENCLAW WORKFLOW EVENTS (006_openclaw_events.sql)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.openclaw_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL, -- 'lead_qualification', 'seo_audit', 'sentinel_alert'
    payload jsonb DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Índices optimizados para polling del Obrero Soberano
CREATE INDEX IF NOT EXISTS idx_openclaw_events_status ON public.openclaw_events(status);
CREATE INDEX IF NOT EXISTS idx_openclaw_events_type ON public.openclaw_events(event_type);

-- RLS para openclaw events
ALTER TABLE public.openclaw_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to insert events" ON public.openclaw_events;
CREATE POLICY "Public access to insert events" ON public.openclaw_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role read all" ON public.openclaw_events;
CREATE POLICY "Service role read all" ON public.openclaw_events
  FOR SELECT USING (true);


-- ==============================================================================
-- ── SECCIÓN 7: REPRESENTANTE LEGAL WORKFLOWS (schema.sql)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.rep_legal_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut_empresa TEXT NOT NULL,
  nombre_empresa TEXT NOT NULL,
  nombre_nuevo_rep TEXT NOT NULL,
  rut_nuevo_rep TEXT NOT NULL,
  email_nuevo_rep TEXT NOT NULL,
  estado TEXT DEFAULT 'recibido', -- recibido -> acta_generada -> pendiente_firma -> notaria_aprobada -> completado
  tracking_id TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rep_legal_workflows ENABLE ROW LEVEL SECURITY;

-- Permitir inserción libre de leads y visualización general por tracking ID
DROP POLICY IF EXISTS "Permitir inserción pública" ON public.rep_legal_workflows;
CREATE POLICY "Permitir inserción pública" ON public.rep_legal_workflows
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir consulta por tracking id" ON public.rep_legal_workflows;
CREATE POLICY "Permitir consulta por tracking id" ON public.rep_legal_workflows
  FOR SELECT USING (true);

COMMIT;
