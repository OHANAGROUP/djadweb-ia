-- Migración: 008_sync_worker.sql
-- Propósito: Tablas para trackear el status de background syncs y guardar snapshots (payloads) de los scrapers.

-- 1. Tabla de Sync Runs (Historial de Ejecuciones)
CREATE TABLE IF NOT EXISTS public.sync_runs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('sii', 'tgr', 'pjud')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error')),
    error_code TEXT,
    latency_ms INTEGER,
    started_at TIMESTAMPTZ DEFAULT now(),
    finished_at TIMESTAMPTZ
);

-- 2. Tabla de Sync Snapshots (Datos obtenidos)
CREATE TABLE IF NOT EXISTS public.sync_snapshots (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    sync_run_id UUID REFERENCES public.sync_runs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('sii', 'tgr', 'pjud')),
    data_payload JSONB DEFAULT '{}'::jsonb,
    changes_detected BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_sync_runs_user_id ON public.sync_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_runs_status ON public.sync_runs(status);
CREATE INDEX IF NOT EXISTS idx_sync_snapshots_user_id ON public.sync_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_snapshots_provider ON public.sync_snapshots(provider);

-- 4. Habilitar RLS
ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_snapshots ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para sync_runs
-- Solo pueden ver sus propios runs
CREATE POLICY "Users can view their own sync runs"
    ON public.sync_runs FOR SELECT
    USING (auth.uid() = user_id);

-- Solo service_role puede insertar o actualizar (el backend Worker)
CREATE POLICY "Service role can manage sync runs"
    ON public.sync_runs
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 6. Políticas para sync_snapshots
-- Solo pueden ver sus propios snapshots
CREATE POLICY "Users can view their own sync snapshots"
    ON public.sync_snapshots FOR SELECT
    USING (auth.uid() = user_id);

-- Solo service_role puede insertar
CREATE POLICY "Service role can manage sync snapshots"
    ON public.sync_snapshots
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
