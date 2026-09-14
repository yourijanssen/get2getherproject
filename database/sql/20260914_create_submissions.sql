-- SQLite: additive only. Apply manually to the persistent Get2Gether database.
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('inquiry', 'review')),
  language TEXT NOT NULL CHECK (language IN ('el', 'en')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  details TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'handled', 'approved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS submissions_status_created ON submissions (status, created_at);
CREATE INDEX IF NOT EXISTS submissions_email_created ON submissions (email, created_at);
