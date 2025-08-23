import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyEdgeJWT } from "./lib/edgeJwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next(); // default response for continuation

  // Admin Route Logic
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;

  const adminTokenRaw = request.cookies.get("admin_token")?.value;
  const adminToken = adminTokenRaw ? JSON.parse(adminTokenRaw) : null;
  const hasValidAdminToken = adminToken ? await verifyEdgeJWT(adminToken, true) : false;

  if (adminTokenRaw && !hasValidAdminToken) {
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

  const userOtpToken = request.cookies.get("user_otp_token")?.value;
  const forgotPassToken = request.cookies.get("user_forgot_pass_token")?.value;

  const hasValidOtpToken = userOtpToken ? await verifyEdgeJWT(userOtpToken) : false;
  const hasValidForgotPassToken = forgotPassToken
    ? await verifyEdgeJWT(forgotPassToken)
    : false;
  console.log(userOtpToken, hasValidOtpToken, await verifyEdgeJWT(userOtpToken));

  if (userOtpToken && !hasValidOtpToken) {
    response.cookies.delete("user_otp_token");
  }

  if (forgotPassToken && !hasValidForgotPassToken) {
    response.cookies.delete("user_forgot_pass_token");
  }

  if (isOtpPage && !hasValidOtpToken && !hasValidForgotPassToken) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isNewPasswordPage && !hasValidForgotPassToken) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/otp", "/new-password"],
};
