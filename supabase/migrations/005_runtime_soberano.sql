-- supabase/migrations/005_runtime_soberano.sql
-- Autor: Pablo Francisco Palominos Naredo [2026]
-- Propósito: Blindaje estructural del Runtime Transaccional

BEGIN;

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

-- 4. TRIGGER DE INMUTABILIDAD PARA EL LOG DE CUMPLIMIENTO
CREATE OR REPLACE FUNCTION public.prevent_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Operación denegada: El registro de auditoría de cumplimiento en DJADWEB-IA es inmutable.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_audit_logs
BEFORE UPDATE OR DELETE ON public.compliance_audit_log
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_mutation();

COMMIT;
