-- PostgreSQL: run manually on the target database before deploying the inbox.
-- Additive only; the legacy SQLite file is not modified.
BEGIN;
CREATE TABLE IF NOT EXISTS site_inquiries (
  id uuid PRIMARY KEY,
  language text NOT NULL CHECK (language IN ('el', 'en')),
  inquiry_type text NOT NULL CHECK (inquiry_type IN ('workshop', 'private')),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (length(email) BETWEEN 1 AND 254),
  message text NOT NULL CHECK (length(message) BETWEEN 1 AND 5000),
  details jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(details) = 'object'),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'handled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS site_inquiries_status_created ON site_inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS site_inquiries_email_created ON site_inquiries(email, created_at DESC);
COMMIT;
