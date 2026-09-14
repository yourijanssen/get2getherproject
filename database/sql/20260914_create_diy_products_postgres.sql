-- Durable DIY product catalogue for Vercel/Neon Postgres.
CREATE TABLE IF NOT EXISTS diy_products (
  id UUID PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  title_en VARCHAR(120) NOT NULL,
  title_el VARCHAR(120) NOT NULL,
  description_en TEXT NOT NULL,
  description_el TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  stock_status VARCHAR(20) NOT NULL CHECK (stock_status IN ('in_stock', 'coming_soon', 'sold_out')),
  image_url VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS diy_products_visible_order
  ON diy_products (is_active, sort_order, created_at DESC);

INSERT INTO diy_products (id, slug, title_en, title_el, description_en, description_el, price_cents, stock_status, sort_order)
VALUES
  ('18d47b6d-2ce8-4c31-8aa9-5c7f4774e001', 'flower-bar-kit', 'Flower bar kit', 'Σετ flower bar', 'A bright tabletop kit for arranging a playful bouquet together.', 'Ένα φωτεινό σετ τραπεζιού για να φτιάξετε μαζί ένα παιχνιδιάρικο μπουκέτο.', 2400, 'in_stock', 10),
  ('18d47b6d-2ce8-4c31-8aa9-5c7f4774e002', 'texture-painting-kit', 'Texture painting kit', 'Σετ ζωγραφικής με υφή', 'Everything you need to make a textured artwork at your own pace.', 'Όλα όσα χρειάζεστε για να δημιουργήσετε ένα έργο ζωγραφικής με υφή στον δικό σας ρυθμό.', 2800, 'in_stock', 20),
  ('18d47b6d-2ce8-4c31-8aa9-5c7f4774e003', 'candle-colour-kit', 'Candle colour kit', 'Σετ χρωματιστών κεριών', 'A colourful candle-making kit for your next slow afternoon.', 'Ένα πολύχρωμο σετ κατασκευής κεριών για το επόμενο χαλαρό σας απόγευμα.', 2200, 'coming_soon', 30)
ON CONFLICT (slug) DO NOTHING;
