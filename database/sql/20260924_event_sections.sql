-- Run manually before deploying the upcoming/past event layout.
-- Adds bilingual CMS labels; preserves custom copy and all event records.
-- Only the original archive-focused page introduction is replaced. Safe to run again.
WITH translations(lang, fields, old_intro, new_intro) AS (
  VALUES
  ('en', '{"upcomingEventsTitle": "Upcoming events", "pastEventsTitle": "Past events", "pastEventsIntro": "A look back at what we created together.", "noUpcomingEvents": "New dates are on the way. Register your interest in a future workshop below."}'::jsonb, 'Explore the things we have made and the moments we have shared.', 'Find your next creative experience and join us.'),
  ('el', '{"upcomingEventsTitle": "Προσεχείς εκδηλώσεις", "pastEventsTitle": "Προηγούμενες εκδηλώσεις", "pastEventsIntro": "Μια ματιά σε όσα δημιουργήσαμε μαζί.", "noUpcomingEvents": "Νέες ημερομηνίες έρχονται σύντομα. Δήλωσε παρακάτω το ενδιαφέρον σου για ένα μελλοντικό εργαστήριο."}'::jsonb, 'Ανακάλυψε όσα δημιουργήσαμε και τις στιγμές που μοιραστήκαμε.', 'Βρες την επόμενη δημιουργική σου εμπειρία και έλα στην παρέα μας.')
), patched AS (
  SELECT s.id, s.content || jsonb_object_agg(t.lang,
    jsonb_set(s.content -> t.lang, '{text}',
      t.fields || (s.content #> ARRAY[t.lang, 'text']) ||
      jsonb_build_object('eventsIntro', CASE
        WHEN s.content #>> ARRAY[t.lang, 'text', 'eventsIntro'] = t.old_intro THEN t.new_intro
        ELSE s.content #>> ARRAY[t.lang, 'text', 'eventsIntro']
      END)
    )
  ) AS content
  FROM site_content s CROSS JOIN translations t
  WHERE s.id = 'website'
  GROUP BY s.id, s.content
)
UPDATE site_content s
SET content = p.content, revision = s.revision + 1, updated_at = NOW()
FROM patched p
WHERE s.id = p.id AND s.content IS DISTINCT FROM p.content;
