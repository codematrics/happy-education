import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
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

    await connect();

    const userToken = (await cookies()).get("user_token")?.value;

    if (!userToken) {
      return NextResponse.json(
        {
          data: null,
          message: "Unauthorized",
          status: false,
        },
        { status: 401 }
      );
    }

    let parsedToken;
    try {
      parsedToken = userToken;
    } catch (parseError) {
      parsedToken = userToken;
    }

    if (!(await verifyJWT(parsedToken))) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid token",
          status: false,
        },
        { status: 401 }
      );
    }

    const decodedToken = await decodeJWT(parsedToken);
    const userId = decodedToken._id;

    const user = await User.findOne({ _id: userId, otp: Number(otp) });

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

    if (user.isVerified) {
      return NextResponse.json(
        {
          data: null,
          message: "Account is already verified",
          status: false,
        },
        { status: 400 }
      );
    }

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

    // Check if OTP is expired (5 minutes)
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

    // Mark user as verified and clear OTP
    await User.updateOne(
      { _id: userId },
      {
        isVerified: true,
        otp: null,
        otpGenerationTime: null,
      }
    );

    return NextResponse.json(
      {
        data: null,
        message: "Account verified successfully!",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
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
