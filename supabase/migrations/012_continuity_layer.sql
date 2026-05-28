-- 012_continuity_layer.sql
-- Añade soporte en la tabla de sesiones de trámite para registrar el control
-- temporal de validaciones externas y forzar re-verificaciones.

ALTER TABLE tramite_sessions 
ADD COLUMN IF NOT EXISTS last_external_check TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS requires_revalidation BOOLEAN DEFAULT FALSE;
