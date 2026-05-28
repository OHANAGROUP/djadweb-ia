-- 013_guardian_schema.sql
-- Tablas auxiliares para soportar la supervisión en tiempo real del RuntimeGuardian,
-- prevención de ejecuciones duplicadas de eventos críticos y control de rollbacks seguros.

-- 1. Registro de Ejecución de Eventos Críticos (Idempotency Control)
CREATE TABLE IF NOT EXISTS event_execution_log (
  event_id UUID PRIMARY KEY,
  session_id UUID REFERENCES tramite_sessions(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'executed', -- 'executed' | 'blocked' | 'skipped'
  reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE event_execution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own event execution logs"
  ON event_execution_log FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM tramite_sessions WHERE id = session_id));

CREATE POLICY "Users insert own event execution logs"
  ON event_execution_log FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM tramite_sessions WHERE id = session_id));

CREATE INDEX idx_event_execution_session ON event_execution_log(session_id);


-- 2. Estado de Control del Guardián (Guardian State Kernel)
CREATE TABLE IF NOT EXISTS guardian_state (
  session_id UUID PRIMARY KEY REFERENCES tramite_sessions(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'active', -- 'active' | 'frozen' | 'rollback_required'
  last_safe_event_index INTEGER DEFAULT 0,
  last_integrity_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE guardian_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own guardian states"
  ON guardian_state FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM tramite_sessions WHERE id = session_id));

CREATE POLICY "Users insert own guardian states"
  ON guardian_state FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM tramite_sessions WHERE id = session_id));

CREATE POLICY "Users update own guardian states"
  ON guardian_state FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM tramite_sessions WHERE id = session_id));
