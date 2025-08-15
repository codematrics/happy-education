import connect from "@/lib/db";
import { assignJWT, decodeJWT, verifyJWT } from "@/lib/jwt";
import { User } from "@/models/User";
import { sendMail } from "@/services/email";
import { emailTemplate } from "@/utils/email";
import { generate4DigitOTP } from "@/utils/otp";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    // Check for both signup and forgot password tokens
    const signupToken = JSON.parse(
      req.cookies.get("user_otp_token")?.value || "{}"
    );
    const forgotPassToken = JSON.parse(
      req.cookies.get("user_forgot_pass_token")?.value || "{}"
    );

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
      return NextResponse.json(
        {
          data: null,
          message: "Invalid or expired session. Please restart the process.",
          status: false,
        },
        { status: 401 }
      );
    }

    const decodedJWT = await decodeJWT<{ _id: string }>(activeToken);

    if (!decodedJWT?._id) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid or expired session",
          status: false,
        },
        { status: 401 }
      );
    }

    await connect();

    const user = await User.findOne({ _id: decodedJWT._id });

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          message: "User not found",
          status: false,
        },
        { status: 404 }
      );
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
      return NextResponse.json(
        {
          data: null,
          message: "Something went wrong. Please try again!",
          status: false,
        },
        { status: 500 }
      );
    }

    // Update the appropriate cookie with new JWT
    (await cookies()).set(cookieName, JSON.stringify(newJwt), {
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

    return NextResponse.json(
      {
        data: null,
        message: "OTP resent successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Resend OTP error:", err);
    return NextResponse.json(
      {
        data: null,
        message: "Internal Server Error",
        status: false,
      },
      { status: 500 }
    );
  }
};
