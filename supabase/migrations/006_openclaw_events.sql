-- supabase/migrations/006_openclaw_events.sql
-- Autor: Pablo Francisco Palominos Naredo [2026]
-- Propósito: Estructuración y persistencia de eventos para OpenClaw/Obrero Soberano

BEGIN;

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

COMMIT;
