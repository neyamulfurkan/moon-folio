import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest): NextResponse | Response {
  const { pathname } = req.nextUrl;

  // Allow login page through always
  if (pathname.startsWith("/admin/login")) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  }

  // For all other /admin/* routes, check for NextAuth session cookie
  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ??
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/((?!_next|favicon\.ico|icon|apple-touch-icon|og\.png|robots\.txt|manifest\.json).*)'],
};