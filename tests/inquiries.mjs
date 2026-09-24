import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import nextEnv from '@next/env';
import { neon } from '@neondatabase/serverless';

nextEnv.loadEnvConfig(process.cwd());
const database = neon(process.env.DATABASE_URL);
const schema = `inquiry_test_${randomUUID().replaceAll('-', '')}`;
const table = `"${schema}".site_inquiries`;
let authenticated = true;
let available = true;
// Route real SQL to a uniquely owned test schema, never to project records.
const sql = (parts, ...values) => {
  const mapped = parts.map(part => part.replaceAll('site_inquiries', table));
  mapped.raw = [...mapped];
  return database(mapped, ...values);
};
sql.transaction = (...args) => database.transaction(...args);
// Load the actual server code with only infrastructure boundaries replaced.
function load(path) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, Request, Response, Buffer, URL, require: name => {
    if (name === '@/lib/diy-products') return { getProductSql: () => available ? sql : null };
    if (name === '@/lib/admin-auth') return { isAdmin: async () => authenticated };
    if (name === 'next/cache') return { revalidatePath() {} };
    if (name === 'next/navigation') return { redirect: url => { throw new Error(`redirect:${url}`); } };
    throw new Error(`Unexpected import: ${name}`);
  } });
  return exports;
}
const { POST } = load('app/api/submissions/route.ts');
const { updateInquiryStatus } = load('app/admin/inquiries/actions.ts');
// Exercise the public handler with ordinary browser request headers.
function submit(body, origin = 'http://localhost:3002') {
  return POST(new Request('http://localhost:3002/api/submissions', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) }));
}
const base = { kind: 'inquiry', language: 'el', name: 'Integration test', email: 'inquiry-test@example.invalid', message: 'A test workshop inquiry.', topic: 'Workshop', inquiryType: 'workshop' };
await database.query(`CREATE SCHEMA "${schema}"`);
try {
  await database.query(`CREATE TABLE ${table} (LIKE site_inquiries INCLUDING ALL)`);
  const id = randomUUID();
  assert.equal((await submit({ ...base, submissionId: id })).status, 201);
  assert.equal((await submit({ ...base, submissionId: id })).status, 200);
  const parallel = await Promise.all(Array.from({ length: 6 }, () => submit({ ...base, submissionId: randomUUID() })));
  assert.equal(parallel.filter(r => r.status === 201).length, 4);
  assert.equal(parallel.filter(r => r.status === 429).length, 2);
  assert.equal((await submit({ ...base, submissionId: id })).status, 200);
  assert.equal((await submit({ ...base, submissionId: randomUUID() }, 'https://other.example')).status, 403);
  assert.equal((await submit({ ...base, submissionId: randomUUID(), inquiryType: 'invalid' })).status, 400);
  const privateId = randomUUID();
  assert.equal((await submit({ ...base, email: 'private-test@example.invalid', language: 'en', inquiryType: 'private', guests: '12', phone: '12345', location: 'Test venue', submissionId: privateId })).status, 201);
  const [saved] = await database.query(`SELECT * FROM ${table} WHERE id=$1`, [privateId]);
  assert.equal(saved.inquiry_type, 'private');
  assert.equal(saved.details.guests, '12');
  assert.equal(saved.status, 'new');
  const form = new FormData(); form.set('id', privateId); form.set('previous', 'new'); form.set('status', 'in_progress');
  authenticated = false;
  await assert.rejects(updateInquiryStatus(form), /Sign in again/);
  authenticated = true;
  await assert.rejects(updateInquiryStatus(form), /notice=saved/);
  await assert.rejects(updateInquiryStatus(form), /notice=changed/);
  form.set('previous', 'in_progress'); form.set('status', 'handled');
  await assert.rejects(updateInquiryStatus(form), /notice=saved/);
  const [handled] = await database.query(`SELECT status FROM ${table} WHERE id=$1`, [privateId]);
  assert.equal(handled.status, 'handled');
  available = false;
  assert.equal((await submit({ ...base, submissionId: randomUUID() })).status, 503);
  console.log('Passed: central persistence, duplicate retries, concurrent rate limit, private details, validation, authentication, status transitions and stale edits.');
} finally {
  // Remove only the isolated schema created by this test run; project data is untouched.
  await database.query(`DROP SCHEMA "${schema}" CASCADE`);
}
