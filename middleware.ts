import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: unknown }) => {
  if (
    !req.auth &&
    req.nextUrl.pathname.startsWith("/admin") &&
    !req.nextUrl.pathname.startsWith("/admin/login")
  ) {
    return Response.redirect(new URL("/admin/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};