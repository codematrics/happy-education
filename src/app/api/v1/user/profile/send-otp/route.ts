import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { User } from "@/models/User";
import { sendMail } from "@/services/email";
import { emailTemplate } from "@/utils/email";
import { generate4DigitOTP } from "@/utils/otp";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async () => {
  try {
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

    const user = await User.findById(userId);
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

    if (!user.email) {
      return NextResponse.json(
        {
          data: null,
          message: "No email address found for verification",
          status: false,
        },
        { status: 400 }
      );
    }

    // Generate new OTP
    const otp = generate4DigitOTP();

    await User.updateOne(
      { _id: userId },
      { otp, otpGenerationTime: new Date() }
    );

    // Send OTP email
    await sendMail(
      emailTemplate.otp(otp),
      `Your verification code is ${otp}. It will expire in 5 minutes.`,
      "Verify your account",
      user.email
    );

    return NextResponse.json(
      {
        data: null,
        message: "Verification code sent to your email",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
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
