import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/jwt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;
  const adminToken = request.cookies.get("admin_token")?.value;
  const hasValidAdminToken = adminToken ? verifyJWT(adminToken) : false;

  const isOtpPage = pathname === "/otp";
  const isNewPasswordPage = pathname === "/new-password";

  const userOtpToken = JSON.parse(
    request.cookies.get("user_otp_token")?.value || "{}"
  );
  const userForgotPassToken = request.cookies.get(
    "user_forgot_pass_token"
  )?.value;

  const hasValidOtpToken = userOtpToken ? verifyJWT(userOtpToken) : false;
  const hasValidForgotPassToken = userForgotPassToken
    ? verifyJWT(userForgotPassToken)
    : false;

  if (isAdminLogin && hasValidAdminToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAdminRoute && !hasValidAdminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isOtpPage && !hasValidOtpToken && !hasValidForgotPassToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isNewPasswordPage && !hasValidForgotPassToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/otp", "/new-password"],
};
