import { NextRequest, NextResponse } from "next/server";
import { resolveLanguage } from "@/lib/language";

// Makes URL language available to the root layout before any HTML is rendered.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const values = request.nextUrl.searchParams.getAll("lang");
  const language = request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/")
    ? "en" : resolveLanguage(values.length === 1 ? values[0] : undefined);
  // Always overwrite these headers: visitors cannot override the URL's language or origin.
  headers.set("x-site-language", language);
  headers.set("x-site-origin", request.nextUrl.origin);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!api/|_next/|images/|.*\\.[^/]+$).*)"] };
