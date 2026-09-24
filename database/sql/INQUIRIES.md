# Inquiry inbox rollout

1. Run `20260924_inquiries.sql` manually against the target PostgreSQL database before deploying this change. It only adds the inbox table and indexes.
2. If an old installation has a persistent SQLite submissions file, preserve that file. On that installation, run `node scripts/import-legacy-inquiries.mjs --output=data/legacy-inquiries.sql` to create a private SQL export. Run the export manually against the target database. The export contains personal data: do not commit it or place it in public storage.
3. For the local configured database, `node scripts/import-legacy-inquiries.mjs --apply` imports directly. Set `GET2GETHER_DATABASE_PATH` to select a different SQLite source. Existing central IDs are never overwritten; the source file is read-only. Legacy reviews are left untouched.
4. After deployment, submit a workshop or private inquiry and find it under `/admin/inquiries`. Verify changing New to In progress to Handled. No email is sent.

The API uses PostgreSQL only; there is no SQLite fallback. If storage is unavailable, the form reports failure and retains the entered values for retry. Retries retain their submission ID; repeated successful requests do not create duplicates.

Run `node tests/inquiries.mjs` to test the actual request handler and status action against an isolated, uniquely named PostgreSQL schema. This requires schema creation privileges. Only that test schema is removed after the test; application records are never changed.
