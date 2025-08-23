import { hashValue } from "@/lib/bcrypt";
import connect from "@/lib/db";
import { assignJWT } from "@/lib/jwt";
import { validateSchema } from "@/lib/schemaValidator";
import { noAuthMiddleware } from "@/middlewares/authMiddleware";
import { User } from "@/models/User";
import { sendMail } from "@/services/email";
import { SignUpUserFormData, signupUserValidations } from "@/types/schema";
import { emailTemplate } from "@/utils/email";
import { generate4DigitOTP } from "@/utils/otp";
import { response } from "@/utils/response";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const postController = async (req: NextRequest) => {
  try {
    const body = await req.json();

    validateSchema(signupUserValidations, body);

    const { email, mobile, password, firstName, lastName }: SignUpUserFormData =
      body;

    await connect();

    const query = [];

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
      return response.error("You are already registered. Please Login!", 404);
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
      return response.error("Something Went wrong. Please Try Again!", 500);
    }

    (await cookies()).set("user_otp_token", JSON.stringify(jwt), {
      httpOnly: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    (await cookies()).set("user_otp_email", JSON.stringify(email), {
      httpOnly: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    return response.success(null, "You are Signed up successfully", 200);
  } catch (error) {
    console.error("SignUp error:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const POST = async (req: NextRequest) =>
  noAuthMiddleware(req, postController);
