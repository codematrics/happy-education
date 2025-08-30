import connect from "@/lib/db";
import { assignJWT, decodeJWT, verifyJWT } from "@/lib/jwt";
import { noAuthMiddleware } from "@/middlewares/authMiddleware";
import { User } from "@/models/User";
import { sendMail } from "@/services/email";
import { emailTemplate } from "@/utils/email";
import { generate4DigitOTP } from "@/utils/otp";
import { response } from "@/utils/response";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const postController = async (req: NextRequest) => {
  try {
    // Check for both signup and forgot password tokens
    const signupToken = req.cookies.get("user_otp_token")?.value;
    const forgotPassToken = req.cookies.get("user_forgot_pass_token")?.value;

    let activeToken = null;
    let isSignupFlow = false;
    let isForgotPasswordFlow = false;
    let cookieName = "";
    let emailSubject = "";

    // Determine which flow this is
    if (signupToken && (await verifyJWT(signupToken))) {
      activeToken = signupToken;
      isSignupFlow = true;
      cookieName = "user_otp_token";
      emailSubject = "Verify your email";
    } else if (forgotPassToken && (await verifyJWT(forgotPassToken))) {
      activeToken = forgotPassToken;
      isForgotPasswordFlow = true;
      cookieName = "user_forgot_pass_token";
      emailSubject = "Reset your password";
    }

    if (!activeToken) {
      return response.error(
        "Invalid or expired session. Please restart the process.",
        401
      );
    }

    const decodedJWT = await decodeJWT<{ _id: string }>(activeToken);

    if (!decodedJWT?._id) {
      return response.error(
        "Invalid or expired session. Please restart the process.",
        401
      );
    }

    await connect();

    const user = await User.findOne({ _id: decodedJWT._id });

    if (!user) {
      return response.error("User not found.", 404);
    }

    // Generate new OTP
    const otp = generate4DigitOTP();

    await User.updateOne(
      { _id: user._id },
      { otp, otpGenerationTime: new Date() }
    );

    // Create new JWT with extended expiry
    const newJwt = await assignJWT({ _id: user._id });

    if (!newJwt) {
      return response.error("Something went wrong. Please try again!", 500);
    }

    // Update the appropriate cookie with new JWT
    (await cookies()).set(cookieName, newJwt, {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send OTP email
    if (user.email) {
      await sendMail(
        emailTemplate.otp(otp),
        `Your new OTP code is ${otp}. It will expire in 5 minutes.`,
        emailSubject,
        user.email
      );
    }

    return response.success(null, "OTP resent successfully", 200);
  } catch (err) {
    console.error("Resend OTP error:", err);
    return response.error("Internal Server Error", 500);
  }
};

export const POST = async (req: NextRequest) =>
  noAuthMiddleware(req, postController);
