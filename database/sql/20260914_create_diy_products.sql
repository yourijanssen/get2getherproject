-- SQLite: additive DIY product management and safe local test inventory.
-- Apply manually to the persistent Get2Gether database before enabling the admin panel.
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS diy_products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_el TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_el TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'coming_soon', 'sold_out')),
  image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS diy_products_visible_order ON diy_products (is_active, sort_order, created_at DESC);

INSERT OR IGNORE INTO diy_products (id, slug, title_en, title_el, description_en, description_el, price_cents, stock_status, sort_order)
VALUES
  ('0e2a1278-5268-4df1-a035-fc61ecf5b8a1', 'flower-bar-kit', 'Flower bar kit', 'Σετ flower bar', 'A bright tabletop kit for arranging a playful bouquet together.', 'Ένα φωτεινό σετ τραπεζιού για να φτιάξετε μαζί ένα παιχνιδιάρικο μπουκέτο.', 2400, 'in_stock', 10),
  ('8d7f2d4b-9a29-4554-a8ef-aaf9c020aa67', 'texture-painting-kit', 'Texture painting kit', 'Σετ ζωγραφικής με υφή', 'Everything you need to make a textured artwork at your own pace.', 'Όλα όσα χρειάζεστε για να δημιουργήσετε ένα έργο ζωγραφικής με υφή στον δικό σας ρυθμό.', 2800, 'in_stock', 20),
  ('2d16704e-722f-4a87-a6b2-ffd865ca1c0c', 'candle-colour-kit', 'Candle colour kit', 'Σετ χρωματιστών κεριών', 'A colourful candle-making kit for your next slow afternoon.', 'Ένα πολύχρωμο σετ κατασκευής κεριών για το επόμενο χαλαρό σας απόγευμα.', 2200, 'coming_soon', 30);
