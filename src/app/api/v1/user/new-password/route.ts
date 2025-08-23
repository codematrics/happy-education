import { hashValue } from "@/lib/bcrypt";
import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { validateSchema } from "@/lib/schemaValidator";
import { noAuthMiddleware } from "@/middlewares/authMiddleware";
import { User } from "@/models/User";
import { NewPasswordFormData, newPasswordValidations } from "@/types/schema";
import { response } from "@/utils/response";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const postController = async (req: NextRequest) => {
  try {
    const body = await req.json();

    validateSchema(newPasswordValidations, body);

    const { password }: NewPasswordFormData = body;
    const forgotPassToken = JSON.parse(
      req.cookies.get("user_forgot_pass_token")?.value || "{}"
    );

    if (!forgotPassToken || !(await verifyJWT(forgotPassToken))) {
      return response.error(
        "Session has expired. Please restart the password reset process.",
        401
      );
    }

    const decodedJWT = await decodeJWT<{ _id: string }>(forgotPassToken);

    if (!decodedJWT?._id) {
      return response.error(
        "Invalid session. Please restart the password reset process.",
        401
      );
    }

    await connect();

    const user = await User.findOne({ _id: decodedJWT._id });

    if (!user) {
      return response.error(
        "User not found. Please restart the password reset process.",
        404
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

    return response.success(
      null,
      "Password updated successfully! You can now login with your new password.",
      200
    );
  } catch (err) {
    console.error("New password error:", err);
    return response.error(
      "Internal Server Error. Please try again later.",
      500
    );
  }
};

export const POST = async (req: NextRequest) =>
  noAuthMiddleware(req, postController);
