-- PostgreSQL: run manually against the target database before deploying reviews.
-- Additive only; existing submissions and site content remain untouched.
BEGIN;
CREATE TABLE IF NOT EXISTS site_reviews (
  id uuid PRIMARY KEY,
  language text NOT NULL CHECK (language IN ('el', 'en')),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (length(email) <= 254),
  message text NOT NULL CHECK (length(message) BETWEEN 10 AND 5000),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS site_reviews_status_created ON site_reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS site_reviews_email_created ON site_reviews(email, created_at DESC);
COMMIT;
