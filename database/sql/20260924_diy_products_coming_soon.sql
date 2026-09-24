-- All current DIY kits are not yet available.
-- Run manually in production. Prices, visibility and other product data are preserved.
UPDATE diy_products
SET stock_status = 'coming_soon', updated_at = NOW()
WHERE stock_status <> 'coming_soon';

-- Verify the resulting catalogue statuses.
SELECT slug, title_en, stock_status, is_active
FROM diy_products
ORDER BY sort_order, created_at DESC;
