import connect from "@/lib/db";
import { assignJWT } from "@/lib/jwt";
import { validateSchema } from "@/lib/schemaValidator";
import { noAuthMiddleware } from "@/middlewares/authMiddleware";
import { User } from "@/models/User";
import { sendMail } from "@/services/email";
import { forgotPasswordValidations } from "@/types/schema";
import { emailTemplate } from "@/utils/email";
import { generate4DigitOTP } from "@/utils/otp";
import { response } from "@/utils/response";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const postController = async (req: NextRequest) => {
  try {
    const json = await req.json();

    validateSchema(forgotPasswordValidations, json);

    await connect();

    const user = await User.findOne({
      $or: [{ email: json.identifier }, { mobileNumber: json.identifier }],
    });

    if (!user) {
      return response.error("Not Registered First Register YourSelf", 401);
    }

    const otp = generate4DigitOTP();

    await User.updateOne(
      { _id: user._id },
      { otp, otpGenerationTime: new Date() }
    );

    const jwt = await assignJWT({ _id: user._id });

    (await cookies()).set("user_forgot_pass_token", JSON.stringify(jwt), {
      httpOnly: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendMail(
      emailTemplate.otp(otp),
      `Your new OTP code is ${otp}. It will expire in 5 minutes.`,
      "Forgot Password",
      user?.email
    );

    return response.success(null, "OTP sent successfully", 200);
  } catch (err) {
    console.error("Resend OTP error:", err);
    return response.error("Internal Server Error", 500);
  }
};

export const POST = async (req: NextRequest) =>
  noAuthMiddleware(req, postController);
