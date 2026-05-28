-- 011_session_engine.sql
-- Tablas para soportar sesiones persistentes de largo plazo, event sourcing y cadena de auditoría segura.

-- 1. Tabla de Sesiones de Trámite
CREATE TABLE IF NOT EXISTS tramite_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tramite_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'paused' | 'completed' | 'abandoned'
  current_step TEXT NOT NULL,
  progress NUMERIC DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  session_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tramite_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sessions"
  ON tramite_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sessions"
  ON tramite_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own sessions"
  ON tramite_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_sessions_user ON tramite_sessions(user_id);
CREATE INDEX idx_sessions_status ON tramite_sessions(status);


-- 2. Tabla de Eventos de Sesión (Event Sourcing & Audit Chain)
CREATE TABLE IF NOT EXISTS tramite_session_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES tramite_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL, -- 'STEP_ADVANCED' | 'HELP_REQUESTED' | 'LLM_CALLED' | 'CONSENT_GRANTED' | 'SESSION_PAUSED' | 'SESSION_RESUMED'
  payload JSONB DEFAULT '{}',
  event_index INTEGER NOT NULL,
  previous_hash TEXT,
  hash TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tramite_session_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own session events"
  ON tramite_session_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own session events"
  ON tramite_session_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_session_events_session ON tramite_session_events(session_id);
CREATE INDEX idx_session_events_index ON tramite_session_events(session_id, event_index);
