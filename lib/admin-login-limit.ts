import { getProductSql } from "@/lib/diy-products";

// Reserves a login attempt atomically across server instances, regardless of IP or username.
export async function reserveAdminLoginAttempt() {
  const sql = getProductSql();
  if (!sql) throw new Error("Login limiter unavailable");
  const [result] = await sql`
    INSERT INTO admin_login_limit (id, window_started_at, attempts)
    VALUES (1, now(), 1)
    ON CONFLICT (id) DO UPDATE SET
      attempts = CASE
        WHEN admin_login_limit.window_started_at <= now() - interval '15 minutes' THEN 1
        ELSE LEAST(admin_login_limit.attempts + 1, 11)
      END,
      window_started_at = CASE
        WHEN admin_login_limit.window_started_at <= now() - interval '15 minutes' THEN now()
        ELSE admin_login_limit.window_started_at
      END
    RETURNING attempts <= 10 AS allowed,
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM (window_started_at + interval '15 minutes' - now()))))::int AS retry_after
  `;
  if (!result || typeof result.allowed !== "boolean") throw new Error("Invalid login limiter response");
  return { allowed: result.allowed, retryAfter: Number(result.retry_after) };
}
