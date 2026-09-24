import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import * as crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import vm from 'node:vm';
import ts from 'typescript';
import { NextResponse } from 'next/server.js';

const run = promisify(execFile);
const schema = `admin_auth_test_${randomUUID().replaceAll('-', '')}`;
const table = `"${schema}".admin_login_limit`;
const env = { NODE_ENV: 'production', GET2GETHER_ADMIN_USERNAME: 'manager', GET2GETHER_ADMIN_PASSWORD: randomUUID() };
let available = true;
let cookieValue;
// Use only local PostgreSQL and an isolated schema, never the project's DATABASE_URL.
async function query(statement) {
  const { stdout } = await run('psql', ['-X', '-h', 'localhost', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-Atq', '-c', statement]);
  return stdout.trim();
}
// Execute the real limiter SQL with table names redirected to this test's owned schema.
async function sql(parts, ...values) {
  assert.equal(values.length, 0);
  const statement = parts.join('').replaceAll('admin_login_limit', table);
  return JSON.parse(await query(`WITH result AS (${statement}) SELECT json_agg(result) FROM result`));
}
// Load real source with only environment and infrastructure boundaries substituted.
function load(path, imports) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, Request, Response, URL, Buffer, Date, process: { env }, require: name => {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  } });
  return exports;
}
const auth = load('lib/admin-auth.ts', { 'node:crypto': crypto, 'next/headers': { cookies: async () => ({ get: () => cookieValue ? { value: cookieValue } : undefined }) } });
const limiter = load('lib/admin-login-limit.ts', { '@/lib/diy-products': { getProductSql: () => available ? sql : null } });
const { POST, DELETE } = load('app/api/admin/login/route.ts', { '@/lib/admin-auth': auth, '@/lib/admin-login-limit': limiter, 'next/server': { NextResponse } });
const { useDraftProtection } = load('components/use-draft-protection.ts', { react: { useEffect() {}, useRef: value => ({ current: value }) } });
// A logout button must respect dirty/upload guards, including modifier-key clicks.
for (const [dirty, locked] of [[true, false], [false, true], [false, false]]) {
  let notified = false;
  let prevented = false;
  let stopped = false;
  // eslint-disable-next-line react-hooks/rules-of-hooks -- This isolated VM test stubs React hooks; browser coverage checks the real component.
  const guard = useDraftProtection(dirty, locked, () => { notified = true; });
  guard.protectNavigation({ target: { closest: selector => selector === '[data-admin-navigation]' ? {} : null }, ctrlKey: true,
    preventDefault() { prevented = true; }, stopPropagation() { stopped = true; } });
  assert.equal(prevented, dirty || locked);
  assert.equal(stopped, dirty || locked);
  assert.equal(notified, dirty || locked);
}
// Browser requests must have the same origin; forwarded headers do not grant trust.
function request(method, body = {}, headers = {}) {
  return new Request('https://example.test/api/admin/login', { method, headers: { origin: 'https://example.test', 'content-type': 'application/json', ...headers }, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
}
// Inspect cookie flags without printing any session token or credentials.
function checkCookie(response, secure, expired = false) {
  const value = response.headers.get('set-cookie');
  assert.match(value, /Path=\//i);
  assert.match(value, /HttpOnly/i);
  assert.match(value, /SameSite=lax/i);
  assert.equal(/; Secure(?:;|$)/i.test(value), secure);
  assert.match(value, expired ? /Max-Age=0(?:;|$)/i : /Max-Age=28800(?:;|$)/i);
}
await query(`CREATE SCHEMA "${schema}"`);
try {
  const migration = readFileSync('database/sql/20260924_admin_login_limit.sql', 'utf8').replaceAll('admin_login_limit', table);
  await query(migration);
  await query(migration); // Additive migration is safe to apply twice.
  assert.equal((await POST(request('POST', {}, { origin: 'https://evil.test' }))).status, 403);
  assert.equal((await POST(request('POST', {}, { origin: '' }))).status, 403);
  assert.equal((await POST(request('POST', {}, { origin: 'https://evil.test', 'x-forwarded-host': 'evil.test' }))).status, 403);
  assert.equal((await POST(request('POST', '{'))).status, 401);
  const valid = { username: env.GET2GETHER_ADMIN_USERNAME, password: env.GET2GETHER_ADMIN_PASSWORD };
  const signedIn = await POST(request('POST', valid));
  assert.equal(signedIn.status, 200);
  checkCookie(signedIn, true);
  cookieValue = signedIn.cookies.get('get2gether_admin').value;
  assert.equal(await auth.isAdmin(), true);
  const signedToken = cookieValue;
  cookieValue += 'tampered';
  assert.equal(await auth.isAdmin(), false);
  cookieValue = signedToken;
  const expiredPayload = `manager.${Math.floor(Date.now() / 1000) - 1}`;
  cookieValue = `${expiredPayload}.${crypto.createHmac('sha256', env.GET2GETHER_ADMIN_PASSWORD).update(expiredPayload).digest('base64url')}`;
  assert.equal(await auth.isAdmin(), false);
  cookieValue = signedToken;
  assert.equal(await query(`SELECT attempts FROM ${table}`), '2');
  const parallel = await Promise.all(Array.from({ length: 18 }, (_, i) => POST(request('POST', { username: `unknown-${i}`, password: 'wrong' }, { 'x-forwarded-for': `192.0.2.${i}`, 'x-vercel-forwarded-for': `192.0.2.${i}` }))));
  assert.equal(parallel.filter(r => r.status === 401).length, 8);
  assert.equal(parallel.filter(r => r.status === 429).length, 10);
  assert.equal(await query(`SELECT attempts FROM ${table}`), '11');
  const blocked = await POST(request('POST', valid));
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0 && Number(blocked.headers.get('retry-after')) <= 900);
  assert.equal(blocked.headers.get('set-cookie'), null);
  assert.equal(await auth.isAdmin(), true); // Throttle does not invalidate an existing session.
  const before = await query(`SELECT window_started_at FROM ${table}`);
  await POST(request('POST', valid));
  assert.equal(await query(`SELECT window_started_at FROM ${table}`), before);
  assert.equal(DELETE(request('DELETE', {}, { origin: 'https://evil.test' })).status, 403);
  const logout = DELETE(request('DELETE'));
  assert.equal(logout.status, 200);
  checkCookie(logout, true, true);
  cookieValue = logout.cookies.get('get2gether_admin').value;
  assert.equal(await auth.isAdmin(), false);
  await query(`UPDATE ${table} SET window_started_at = now() - interval '16 minutes'`);
  env.NODE_ENV = 'development';
  const afterWindow = await POST(request('POST', valid));
  assert.equal(afterWindow.status, 200);
  checkCookie(afterWindow, false);
  checkCookie(DELETE(request('DELETE')), false, true);
  assert.equal(await query(`SELECT attempts FROM ${table}`), '1');
  available = false;
  assert.equal((await POST(request('POST', valid))).status, 503);
  assert.equal(DELETE(request('DELETE')).status, 200);
  available = true;
  await query(`ALTER TABLE ${table} RENAME TO temporarily_missing`);
  assert.equal((await POST(request('POST', valid))).status, 503);
  console.log('PASS: atomic parallel throttling, username/IP spoofing, invalid JSON, success without reset, expiry recovery, fail-closed storage, origin checks, production/development cookies and session logout.');
} finally {
  // Delete only the uniquely owned test schema; existing project data is untouched.
  await query(`DROP SCHEMA "${schema}" CASCADE`);
}
