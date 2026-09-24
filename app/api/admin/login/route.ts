import {
  adminCookie,
  createAdminSession,
  expiredAdminCookie,
  validManagerCredentials,
} from "@/lib/admin-auth";
import { reserveAdminLoginAttempt } from "@/lib/admin-login-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Rejects cross-site browser mutations; forwarding headers never define the trusted origin.
function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

// Starts a manager session only after reserving a shared, database-backed login attempt.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const attempt = await reserveAdminLoginAttempt();
    if (!attempt.allowed) return NextResponse.json(
      { error: "Too many sign-in attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(attempt.retryAfter), "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Sign-in temporarily unavailable" }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!validManagerCredentials(username, password))
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  const session = createAdminSession();
  if (!session)
    return Response.json({ error: "Admin is not configured" }, { status: 503 });
  const response = NextResponse.json({ signedIn: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(adminCookie(session));
  return response;
}

// Clears the session with the same production flags, independently of login throttling.
export function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const response = NextResponse.json({ signedOut: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(expiredAdminCookie());
  return response;
}
