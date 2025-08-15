import { hashValue } from "@/lib/bcrypt";
import connect from "@/lib/db";
import { assignJWT } from "@/lib/jwt";
import { validateSchema } from "@/lib/schemaValidator";
import { User } from "@/models/User";
import { sendMail } from "@/services/email";
import { SignUpUserFormData, signupUserValidations } from "@/types/schema";
import { emailTemplate } from "@/utils/email";
import { generate4DigitOTP } from "@/utils/otp";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    validateSchema(signupUserValidations, body);

    const {
      email,
      mobile,
      password,
      firstName,
      lastName,
      identifier,
    }: SignUpUserFormData = body;

    await connect();

    let query = [];

    if (email) {
      query.push({ email });
    }

    if (mobile) {
      query.push({ mobileNumber: mobile });
    }

    const existingUser = await User.findOne({
      $or: query,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          data: null,
          message: "You are already registered. Please Login!",
          status: false,
        },
        { status: 404 }
      );
    }

    const otp = generate4DigitOTP();

    const newUser = await User.create({
      email,
      otp: otp,
      otpGenerationTime: new Date(),
      mobileNumber: mobile,
      password: await hashValue(password),
      firstName,
      lastName,
    });

    if (email) {
      await sendMail(
        emailTemplate.otp(otp),
        `Your OTP code is ${otp}. It will expire in 5 minutes.`,
        "Verify your email",
        email
      );
    }

    const jwt = await assignJWT({ _id: newUser._id });

    if (!jwt) {
      return NextResponse.json(
        {
          data: null,
          message: "Something Went wrong. Please Try Again!",
          status: false,
        },
        { status: 500 }
      );
    }

    (await cookies()).set("user_otp_token", JSON.stringify(jwt), {
      httpOnly: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    (await cookies()).set("user_otp_email", JSON.stringify(email), {
      httpOnly: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    return NextResponse.json(
      {
        data: null,
        message: "You are Signed up successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("SignUp error:", error);
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
