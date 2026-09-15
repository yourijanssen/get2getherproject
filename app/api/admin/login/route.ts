import {
  adminCookie,
  createAdminSession,
  expiredAdminCookie,
  validManagerCredentials,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

// Starts or clears the manager-only session used by the DIY product editor.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!validManagerCredentials(username, password))
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  const session = createAdminSession();
  if (!session)
    return Response.json({ error: "Admin is not configured" }, { status: 503 });
  const response = Response.json({ signedIn: true });
  response.headers.append(
    "Set-Cookie",
    `${adminCookie(session).name}=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${adminCookie(session).maxAge}`,
  );
  return response;
}

export function DELETE() {
  const cookie = expiredAdminCookie();
  const response = Response.json({ signedOut: true });
  response.headers.append(
    "Set-Cookie",
    `${cookie.name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
  return response;
}
