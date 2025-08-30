import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJWTJose } from "./lib/jose";

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    console.error("❌ JWT verification failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("📝 Middleware triggered on:", pathname);

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;

  const adminTokenRaw = request.cookies.get("admin_token")?.value;
  const adminToken = adminTokenRaw ? adminTokenRaw : null;
  const hasValidAdminToken = adminToken
    ? await verifyJWTJose(adminToken)
    : false;

  console.log(
    "🔑 Admin token present:",
    !!adminTokenRaw,
    "| Valid:",
    hasValidAdminToken
  );

  if (adminTokenRaw && !hasValidAdminToken) {
    console.log("🗑️ Deleting invalid admin_token cookie");
    (await cookies()).delete("admin_token");
  }

  if (isAdminLogin && hasValidAdminToken) {
    console.log("✅ Already logged in → Redirecting to /admin");
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAdminRoute && !hasValidAdminToken) {
    console.log("⛔ Unauthorized admin access → Redirecting to /admin/login");
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

  console.log(
    "📌 OTP token present:",
    !!userOtpToken,
    "| Valid:",
    hasValidOtpToken
  );
  console.log(
    "📌 Forgot password token present:",
    !!forgotPassToken,
    "| Valid:",
    hasValidForgotPassToken
  );

  if (userOtpToken && !hasValidOtpToken) {
    console.log("🗑️ Deleting invalid user_otp_token cookie");
    (await cookies()).delete("user_otp_token");
  }

  if (forgotPassToken && !hasValidForgotPassToken) {
    console.log("🗑️ Deleting invalid user_forgot_pass_token cookie");
    (await cookies()).delete("user_forgot_pass_token");
  }

  if (isOtpPage && !hasValidOtpToken && !hasValidForgotPassToken) {
    console.log("⛔ OTP page access denied → Redirecting to /signin");
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isNewPasswordPage && !hasValidForgotPassToken) {
    console.log("⛔ New password page access denied → Redirecting to /signin");
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  console.log("✅ Access granted for:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/otp", "/new-password"],
};
