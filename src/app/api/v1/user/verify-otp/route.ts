import connect from "@/lib/db";
import { assignJWT, decodeJWT, verifyJWT } from "@/lib/jwt";
import { validateSchema } from "@/lib/schemaValidator";
import { User } from "@/models/User";
import { OtpFormData, otpValidations } from "@/types/schema";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    validateSchema(otpValidations, body);

    const { otp }: OtpFormData = body;

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

    // Determine which flow this is
    if (signupToken && (await verifyJWT(signupToken))) {
      activeToken = signupToken;
      isSignupFlow = true;
    } else if (forgotPassToken && (await verifyJWT(forgotPassToken))) {
      activeToken = forgotPassToken;
      isForgotPasswordFlow = true;
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

    console.log("Connected to database", decodedJWT, otp);

    // Find user with matching OTP
    const user = await User.findOne({ _id: decodedJWT._id, otp: Number(otp) });

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid OTP. Please check and try again.",
          status: false,
        },
        { status: 400 }
      );
    }

    // Check OTP expiration (5 minutes)
    if (!user.otpGenerationTime) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid OTP session. Please request a new OTP.",
          status: false,
        },
        { status: 400 }
      );
    }

    const otpAge = Date.now() - new Date(user.otpGenerationTime).getTime();
    if (otpAge > 5 * 60 * 1000) {
      return NextResponse.json(
        {
          data: null,
          message: "OTP has expired. Please request a new one.",
          status: false,
        },
        { status: 400 }
      );
    }

    if (isSignupFlow) {
      // For signup: activate user account and log them in
      await User.updateOne(
        { _id: user._id },
        {
          isVerified: true,
          otp: null,
          otpGenerationTime: null,
        }
      );

      const jwt = await assignJWT({ _id: user._id });

      if (!jwt) {
        return NextResponse.json(
          {
            data: null,
            message: "Something went wrong. Please try again!",
            status: false,
          },
          { status: 500 }
        );
      }

      // Clear signup cookies and set user token
      (await cookies()).delete("user_otp_token");
      (await cookies()).delete("user_otp_email");

      (await cookies()).set("user_token", JSON.stringify(jwt), {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return NextResponse.json(
        {
          data: null,
          message: "Account verified successfully! You are now logged in.",
          status: true,
        },
        { status: 200 }
      );
    } else if (isForgotPasswordFlow) {
      // For forgot password: clear OTP and allow password reset
      await User.updateOne(
        { _id: user._id },
        { otp: null, otpGenerationTime: null }
      );

      // Keep forgot password token for new password page
      return NextResponse.json(
        {
          data: null,
          message:
            "OTP verified successfully. You can now reset your password.",
          status: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        data: null,
        message: "Invalid verification flow",
        status: false,
      },
      { status: 400 }
    );
  } catch (err) {
    console.error("Verify OTP error:", err);
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
