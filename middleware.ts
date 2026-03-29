import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest): NextResponse | Response {
  const { pathname } = req.nextUrl;

  // Allow login page through always
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // For all other /admin/* routes, check for NextAuth session cookie
  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ??
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};