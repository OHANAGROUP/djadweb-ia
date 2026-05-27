-- 010_outcome_tracking.sql
-- Tabla para registrar cada ejecución de trámite y su resultado medible.

CREATE TABLE IF NOT EXISTS tramite_outcomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_id UUID,
  tramite_id TEXT NOT NULL,
  institution TEXT NOT NULL,
  category TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress',  -- 'in_progress' | 'completed' | 'abandoned'
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tramite_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own outcomes"
  ON tramite_outcomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own outcomes"
  ON tramite_outcomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own outcomes"
  ON tramite_outcomes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_outcomes_user ON tramite_outcomes(user_id);
CREATE INDEX idx_outcomes_status ON tramite_outcomes(status);
CREATE INDEX idx_outcomes_tramite ON tramite_outcomes(tramite_id);
