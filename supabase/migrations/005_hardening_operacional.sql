-- supabase/migrations/005_hardening_operacional.sql
-- Autor: Pablo Francisco Palominos Naredo [2026]
-- Propósito: Actualización estructural a SHA-256, Telemetría de Costos y Control de Bucles

BEGIN;

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

COMMIT;
