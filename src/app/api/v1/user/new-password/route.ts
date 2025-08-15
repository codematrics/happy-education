import { hashValue } from "@/lib/bcrypt";
import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { validateSchema } from "@/lib/schemaValidator";
import { User } from "@/models/User";
import { NewPasswordFormData, newPasswordValidations } from "@/types/schema";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    validateSchema(newPasswordValidations, body);

    const { password }: NewPasswordFormData = body;
    const forgotPassToken = JSON.parse(
      req.cookies.get("user_forgot_pass_token")?.value || "{}"
    );

    if (!forgotPassToken || !(await verifyJWT(forgotPassToken))) {
      return NextResponse.json(
        {
          data: null,
          message:
            "Session has expired. Please restart the password reset process.",
          status: false,
        },
        { status: 401 }
      );
    }

    const decodedJWT = await decodeJWT<{ _id: string }>(forgotPassToken);

    if (!decodedJWT?._id) {
      return NextResponse.json(
        {
          data: null,
          message:
            "Invalid session. Please restart the password reset process.",
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
          message: "User not found. Please restart the password reset process.",
          status: false,
        },
        { status: 404 }
      );
    }

    // Update password and clear any remaining OTP data
    await User.updateOne(
      { _id: user._id },
      {
        password: await hashValue(password),
        otp: null,
        otpGenerationTime: null,
      }
    );

    // Clear the forgot password token
    (await cookies()).delete("user_forgot_pass_token");

    return NextResponse.json(
      {
        data: null,
        message:
          "Password updated successfully! You can now login with your new password.",
        status: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("New password error:", err);

    if (err instanceof Error && err.message.includes("Validation failed")) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid password format",
          status: false,
        },
        { status: 400 }
      );
    }

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
