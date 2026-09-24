-- Add existing local catalogue artwork to the matching durable DIY product records.
-- Run manually in the target PostgreSQL database after deploying the public files.
-- This is additive: it fills only products that do not yet have a product image.
BEGIN;

UPDATE diy_products
SET image_url = CASE slug
  WHEN 'flower-bar-kit' THEN '/images/catalogue/flowers.png'
  WHEN 'texture-painting-kit' THEN '/images/catalogue/texture.png'
END,
updated_at = NOW()
WHERE image_url IS NULL
  AND slug IN ('flower-bar-kit', 'texture-painting-kit');

COMMIT;

-- Verify image coverage; upload an authentic candle-kit image through /admin/diy-products.
SELECT slug, title_en, image_url, stock_status, is_active
FROM diy_products
ORDER BY sort_order, created_at DESC;
