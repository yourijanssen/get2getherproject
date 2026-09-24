-- Run before deploying homepage image management. Existing selections and copy are preserved.
BEGIN;
UPDATE site_content
SET content = jsonb_set(
    jsonb_set(content, '{el,heroImages}', COALESCE(content #> '{el,heroImages}', '["/images/catalogue/building.png","/images/catalogue/flowers.png","/images/catalogue/texture.png"]'::jsonb)),
    '{en,heroImages}', COALESCE(content #> '{en,heroImages}', '["/images/catalogue/building.png","/images/catalogue/flowers.png","/images/catalogue/texture.png"]'::jsonb)
  ),
  revision = revision + 1,
  updated_at = NOW()
WHERE id = 'website'
  AND (content #> '{el,heroImages}' IS NULL OR content #> '{en,heroImages}' IS NULL);
COMMIT;
