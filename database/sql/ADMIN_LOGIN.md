# Admin login protection

Run `20260924_admin_login_limit.sql` manually against the application's database before deploying this change. The table is created empty; no existing data is modified. Requests never create schema automatically. If the database or table is unavailable, login fails closed with HTTP 503; existing sessions and logout still work.

The single manager login has a shared quota of 10 attempts per anchored 15-minute window. All same-origin credential submissions count, including successful logins and malformed JSON. Unknown usernames and forged forwarding headers cannot create new quotas. Atomic PostgreSQL upserts prevent concurrent requests or different Vercel instances from exceeding the quota. Blocked requests return HTTP 429 and `Retry-After`, without extending the window. No passwords, usernames or IP addresses are stored in the limiter.

Trade-off: a deliberate attack can consume the shared quota and temporarily prevent the manager from signing in. Existing sessions are unaffected. This application-level limit does not replace hosting-layer DDoS protection and does not eliminate database request costs. It is not a sliding-window limit: requests near a window boundary can use both windows' allowances.

Cookies retain HttpOnly, SameSite=Lax and Path=/, with Secure when NODE_ENV=production. Logout expires the browser cookie; it does not revoke previously copied stateless tokens (the existing eight-hour expiry still applies).

Verification: `node tests/admin-auth.mjs` uses a newly created, uniquely named schema in local PostgreSQL (`psql -d postgres`). It removes only its own test schema, and never uses DATABASE_URL or project records.
