-- Run manually before deploying structured event decision information.
-- Existing event records remain unchanged; new and edited events persist these JSONB fields.
-- No table migration is needed because site_events.content already stores event data as JSONB.

-- Verify the fields after publishing or editing an event in the manager:
SELECT
  slug,
  content ->> 'locationEl' AS location_el,
  content ->> 'priceCents' AS price_cents,
  content ->> 'materialsEl' AS materials_el,
  content ->> 'availability' AS availability
FROM site_events
ORDER BY sort_order, slug;
