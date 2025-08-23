import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next(); // default response for continuation

  // Admin Route Logic
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;

  const adminToken = request.cookies.get("admin_token")?.value;
  const hasValidAdminToken = adminToken ? await verifyJWT(adminToken) : false;

  if (adminToken && !hasValidAdminToken) {
    response.cookies.delete("admin_token");
  }

  if (isAdminLogin && hasValidAdminToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAdminRoute && !hasValidAdminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // OTP & Forgot Password Logic
  const isOtpPage = pathname === "/otp";
  const isNewPasswordPage = pathname === "/new-password";

  const otpTokenRaw = request.cookies.get("user_otp_token")?.value;
  const forgotPassToken = request.cookies.get("user_forgot_pass_token")?.value;

  const userOtpToken = otpTokenRaw ? await JSON.parse(otpTokenRaw) : null;

  const hasValidOtpToken = userOtpToken ? await verifyJWT(userOtpToken) : false;
  const hasValidForgotPassToken = forgotPassToken
    ? await verifyJWT(forgotPassToken)
    : false;
  console.log(userOtpToken, hasValidOtpToken, await verifyJWT(userOtpToken));

  if (otpTokenRaw && !hasValidOtpToken) {
    response.cookies.delete("user_otp_token");
  }

  if (forgotPassToken && !hasValidForgotPassToken) {
    response.cookies.delete("user_forgot_pass_token");
  }

  if (isOtpPage && !hasValidOtpToken && !hasValidForgotPassToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isNewPasswordPage && !hasValidForgotPassToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/otp", "/new-password"],
};
