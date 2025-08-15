import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/jwt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;
  const adminToken = request.cookies.get("admin_token")?.value;
  const hasValidAdminToken = adminToken ? verifyJWT(adminToken) : false;

  // User auth routes protection
  const isOtpPage = pathname === "/otp";
  const isNewPasswordPage = pathname === "/new-password";
  const isProtectedAuthPage = isOtpPage || isNewPasswordPage;

  // Check for auth cookies
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

  // 1. Admin route protection
  if (isAdminLogin && hasValidAdminToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAdminRoute && !hasValidAdminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // 2. OTP page protection - only accessible with valid signup or forgot password token
  if (isOtpPage && !hasValidOtpToken && !hasValidForgotPassToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. New password page protection - only accessible with valid forgot password token
  if (isNewPasswordPage && !hasValidForgotPassToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow everything else
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/otp", "/new-password"],
};
