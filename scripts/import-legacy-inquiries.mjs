import { DatabaseSync } from 'node:sqlite';
import { existsSync, writeFileSync } from 'node:fs';
import nextEnv from '@next/env';
import { neon } from '@neondatabase/serverless';

nextEnv.loadEnvConfig(process.cwd());
const source = process.env.GET2GETHER_DATABASE_PATH || './data/get2gether.sqlite';
if (!existsSync(source)) { console.log('No legacy database found; nothing imported.'); process.exit(0); }
const db = new DatabaseSync(source, { readOnly: true });
const rows = db.prepare("SELECT * FROM submissions WHERE kind = 'inquiry'").all();
db.close();
// Preserve original IDs, timestamps and details; an existing central record always wins.
const records = rows.map(row => {
  const details = JSON.parse(row.details);
  if (!details || typeof details !== 'object' || Array.isArray(details)) throw new Error('Invalid legacy details; source unchanged.');
  return [row.id, row.language, details.guests || details.location ? 'private' : 'workshop', row.name, row.email, row.message, JSON.stringify(details), row.status === 'handled' ? 'handled' : 'new', row.created_at];
});
const query = 'INSERT INTO site_inquiries (id, language, inquiry_type, name, email, message, details, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9::timestamptz) ON CONFLICT (id) DO NOTHING';
if (process.argv.includes('--apply')) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  const sql = neon(process.env.DATABASE_URL);
  if (records.length) await sql.transaction(records.map(values => sql.query(query, values)));
  console.log(`Processed ${records.length} legacy inquiries. Existing rows and SQLite source preserved.`);
} else {
  const output = process.argv.find(arg => arg.startsWith('--output='))?.slice(9);
  if (!output) { console.log(`${records.length} legacy inquiries. Use --apply for the configured database or --output=data/legacy-inquiries.sql for a private manual SQL export.`); process.exit(0); }
  // Escape PostgreSQL string literals; the export contains personal data and must stay private.
  const literal = value => "'" + String(value).replaceAll("'", "''") + "'";
  const statements = records.map(values => `INSERT INTO site_inquiries (id,language,inquiry_type,name,email,message,details,status,created_at) VALUES (${values.map(literal).join(',')}) ON CONFLICT (id) DO NOTHING;`);
  writeFileSync(output, ['BEGIN;', 'SET LOCAL standard_conforming_strings = on;', ...statements, 'COMMIT;'].join('\n'), { flag: 'wx', mode: 0o600 });
  console.log(`Exported ${records.length} inquiries. Keep this file private; do not commit it.`);
}
