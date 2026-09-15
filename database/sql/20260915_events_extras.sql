-- Events and Extras: additive migration; existing records are preserved.
BEGIN;
CREATE TABLE IF NOT EXISTS site_events (
 id UUID PRIMARY KEY,
 slug VARCHAR(80) NOT NULL UNIQUE,
 content JSONB NOT NULL CHECK (jsonb_typeof(content) = 'object'),
 is_active BOOLEAN NOT NULL DEFAULT FALSE,
 sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS site_events_published_order ON site_events (is_active, sort_order);
CREATE TABLE IF NOT EXISTS site_extras (
 id UUID PRIMARY KEY,
 slug VARCHAR(80) NOT NULL UNIQUE,
 content JSONB NOT NULL CHECK (jsonb_typeof(content) = 'object'),
 is_active BOOLEAN NOT NULL DEFAULT FALSE,
 sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS site_extras_published_order ON site_extras (is_active, sort_order);
INSERT INTO site_events (id,slug,content,is_active,sort_order) VALUES ('28d47b6d-2ce8-4c31-8aa9-5c7f4774e001','swap-together','{"titleEn":"Let’s swap together","titleEl":"Ας ανταλλάξουμε μαζί","descriptionEn":"Give pre-loved objects a new story. A gathering built around sharing, discovery and a little more connection with your neighbours.","descriptionEl":"Χάρισε μια νέα ιστορία σε αγαπημένα αντικείμενα. Μια συνάντηση γεμάτη μοίρασμα, ανακαλύψεις και σύνδεση με τους ανθρώπους της γειτονιάς.","images":["/images/catalogue/swap.png"],"date":"2026-04-26","startTime":"18:00","endTime":"21:00"}'::jsonb,TRUE,0) ON CONFLICT DO NOTHING;
INSERT INTO site_events (id,slug,content,is_active,sort_order) VALUES ('28d47b6d-2ce8-4c31-8aa9-5c7f4774e002','pipe-cleaner-flowers','{"titleEn":"Pipe cleaner flowers","titleEl":"Λουλούδια από σύρμα πίπας","descriptionEn":"Bright colours, soft materials and flowers that last. Explore a playful way to create your own handmade bouquet.","descriptionEl":"Έντονα χρώματα, μαλακά υλικά και λουλούδια που μένουν. Ανακάλυψε έναν παιχνιδιάρικο τρόπο να φτιάξεις το δικό σου χειροποίητο μπουκέτο.","images":["/images/catalogue/flowers.png"],"date":"2026-05-10","startTime":"18:00","endTime":"20:00"}'::jsonb,TRUE,10) ON CONFLICT DO NOTHING;
INSERT INTO site_events (id,slug,content,is_active,sort_order) VALUES ('28d47b6d-2ce8-4c31-8aa9-5c7f4774e003','textured-art','{"titleEn":"Textured art","titleEl":"Ανάγλυφη τέχνη","descriptionEn":"Explore shape, texture and your own creative instinct. A chance to slow down and make something with your hands.","descriptionEl":"Εξερεύνησε τις φόρμες, τις υφές και τη δημιουργικότητά σου. Μια ευκαιρία να χαλαρώσεις και να φτιάξεις κάτι με τα χέρια σου.","images":["/images/catalogue/texture.png","/images/catalogue/plaster.png"],"date":"2026-05-24","startTime":"18:00","endTime":"20:00"}'::jsonb,TRUE,20) ON CONFLICT DO NOTHING;
INSERT INTO site_events (id,slug,content,is_active,sort_order) VALUES ('28d47b6d-2ce8-4c31-8aa9-5c7f4774e004','building-together','{"titleEn":"Building together","titleEl":"Χτίζουμε μαζί","descriptionEn":"Piece by piece, make something colourful. A relaxed creative experience with plenty of room for conversation.","descriptionEl":"Κομμάτι κομμάτι, φτιάξε κάτι πολύχρωμο. Μια χαλαρή δημιουργική εμπειρία με άφθονο χώρο για συζήτηση.","images":["/images/catalogue/building.png"],"date":"2026-03-22","startTime":"12:00","endTime":"14:00"}'::jsonb,TRUE,30) ON CONFLICT DO NOTHING;
INSERT INTO site_extras (id,slug,content,is_active,sort_order) VALUES ('38d47b6d-2ce8-4c31-8aa9-5c7f4774e001','gift-card','{"titleEn":"A little gift. A shared experience.","titleEl":"Ένα μικρό δώρο. Μια κοινή εμπειρία.","descriptionEn":"Interested in gifting a Get2Gether workshop? Ask us about the possibilities and availability.","descriptionEl":"Θέλεις να χαρίσεις ένα εργαστήριο Get2Gether; Ρώτησέ μας για τις επιλογές και τη διαθεσιμότητα.","images":["/images/catalogue/gift.png"],"date":"","startTime":"","endTime":""}'::jsonb,TRUE,0) ON CONFLICT DO NOTHING;
INSERT INTO site_extras (id,slug,content,is_active,sort_order) VALUES ('38d47b6d-2ce8-4c31-8aa9-5c7f4774e002','loyalty-card','{"titleEn":"More moments together","titleEl":"Περισσότερες στιγμές μαζί","descriptionEn":"Ask us about the Get2Gether loyalty card and how your workshop visits can count towards it.","descriptionEl":"Ρώτησέ μας για την κάρτα επιβράβευσης Get2Gether και πώς μπορούν να μετρήσουν οι συμμετοχές σου.","images":["/images/catalogue/loyalty.png"],"date":"","startTime":"","endTime":""}'::jsonb,TRUE,10) ON CONFLICT DO NOTHING;
COMMIT;

