import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const sessionName = "get2gether_admin";
const sessionLifetime = 60 * 60 * 8;

function credentials() {
  const password = process.env.GET2GETHER_ADMIN_PASSWORD;
  if (!password) return null;
  return {
    username: process.env.GET2GETHER_ADMIN_USERNAME || "manager",
    password,
  };
}

function signature(value: string, password: string) {
  return createHmac("sha256", password).update(value).digest("base64url");
}

// Validates the configured manager credentials without exposing timing differences.
export function validManagerCredentials(username: string, password: string) {
  const configured = credentials();
  if (!configured) return false;
  const expected = Buffer.from(`${configured.username}\0${configured.password}`);
  const received = Buffer.from(`${username}\0${password}`);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export function createAdminSession() {
  const configured = credentials();
  if (!configured) return null;
  const expires = Math.floor(Date.now() / 1000) + sessionLifetime;
  const payload = `${configured.username}.${expires}`;
  return `${payload}.${signature(payload, configured.password)}`;
}

export async function isAdmin() {
  const configured = credentials();
  const token = (await cookies()).get(sessionName)?.value;
  if (!configured || !token) return false;
  const [username, expires, suppliedSignature, extra] = token.split(".");
  if (extra || username !== configured.username || !/^\d+$/.test(expires))
    return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;
  const expected = signature(`${username}.${expires}`, configured.password);
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(suppliedSignature || "");
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}

export function adminCookie(value: string) {
  return {
    name: sessionName,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: sessionLifetime,
  };
}

export function expiredAdminCookie() {
  return { ...adminCookie(""), maxAge: 0 };
}
