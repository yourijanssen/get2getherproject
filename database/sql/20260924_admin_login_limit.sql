-- Apply manually to the application's database BEFORE deploying the login hardening.
-- Additive only: no existing project records are modified or deleted.
CREATE TABLE IF NOT EXISTS admin_login_limit (
  id smallint PRIMARY KEY CHECK (id = 1),
  window_started_at timestamptz NOT NULL,
  attempts smallint NOT NULL CHECK (attempts BETWEEN 1 AND 11)
);
