import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight gate: Auth.js session cookie presence.
 * Full session validation happens in API routes / server components via auth().
 * Avoid importing auth.ts here — it pulls Node-only deps (postgres, nodemailer).
 */
export function middleware(req: NextRequest) {
  const sessionCookie =
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token");

  if (!sessionCookie?.value) {
    const url = new URL("/auth/signin", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding/:path*"],
};
