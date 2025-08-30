import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJWTJose } from "./lib/jose";

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;

  const adminTokenRaw = request.cookies.get("admin_token")?.value;
  const adminToken = adminTokenRaw ? adminTokenRaw : null;
  const hasValidAdminToken = adminToken
    ? await verifyJWTJose(adminToken)
    : false;

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

  const hasValidOtpToken = userOtpToken
    ? await verifyJWTJose(userOtpToken)
    : false;
  const hasValidForgotPassToken = forgotPassToken
    ? await verifyJWTJose(forgotPassToken)
    : false;

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
