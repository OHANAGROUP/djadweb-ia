-- ============================================================
-- DJADWEB-IA® — Migración 002: SII, TGR y Credenciales
-- ============================================================

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

-- 5. RLS
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sii_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tgr_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credentials" ON public.user_credentials
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credentials" ON public.user_credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credentials" ON public.user_credentials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sii queries" ON public.sii_queries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sii queries" ON public.sii_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tgr queries" ON public.tgr_queries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tgr queries" ON public.tgr_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_user_credentials_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_credentials_updated_at ON public.user_credentials;
CREATE TRIGGER user_credentials_updated_at
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_user_credentials_updated_at();
