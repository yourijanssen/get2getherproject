# Get2Gether Project

Basic Next.js project setup.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
website voor Ελπίδα

## Experiences and forms

The Greek/English interface follows the Weekplore reference with Get2Gether artwork.
The home page supports hero and service carousels, workshop details, private event
inquiries, gift/loyalty information, and moderated review submissions. Existing
workshop posters are historical material, not live booking inventory.

Node.js 22.13+ is required for the built-in SQLite driver. No external database
package is needed. Apply the additive SQL manually before using the forms:

```sh
mkdir -p data
sqlite3 data/get2gether.sqlite < database/sql/20260914_create_submissions.sql
```

For hosting, set `GET2GETHER_DATABASE_PATH` to an absolute path on a persistent,
private, writable volume and apply the SQL to that database manually. Keep the
SQLite database and WAL files outside deployment replacement/cleanup paths and
back them up. An ephemeral/serverless filesystem is not suitable for this setup.
The application does not create or migrate databases during requests.

Submissions remain `pending`. They are not sent by email, published as reviews,
or treated as confirmed bookings. Administrators can inspect them privately:

```sql
SELECT id, kind, language, name, email, message, rating, details, status, created_at
FROM submissions ORDER BY created_at DESC;
```

Live bookings/payments still require confirmed dates, pricing, capacity and a
payment provider. Review publication and email delivery need an administration /
notification workflow before a public launch. No Weekplore customer data or
booking inventory is copied.

Use `NEXT_DIST_DIR=.next-qa npm run build` to build independently of the normal
development server. QA uses a separate temporary SQLite database.

## Site content workspace

`/admin/site-content` edits the home page, page titles, about/contact copy,
navigation, footer, form labels and Extras resource links in Greek and English.
Events, Extras records and DIY products keep their separate workspaces.

Before deploying this feature, manually run
`database/sql/20260922_site_content.sql` against the PostgreSQL database configured
by `DATABASE_URL`. This additive, repeatable SQL seeds the existing website copy
and never overwrites an existing `site_content` record. It has been applied to
the database configured for local development; apply it separately to production.
Public pages read this database record directly and require the migration.

Changes publish when a manager saves a section. Both translations are required.
The editor keeps unsaved text after errors and rejects stale saves when another
manager has updated the content. Page previews open the saved public version.
