// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/jwt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;

  const token = request.cookies.get("admin_token")?.value;
  const hasValidToken = token ? verifyJWT(token) : false;

  // 1. Redirect authenticated users away from /admin/login
  if (isAdminLogin && hasValidToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // 2. Protect all other /admin routes
  if (isAdminRoute && !hasValidToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Allow everything else
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
