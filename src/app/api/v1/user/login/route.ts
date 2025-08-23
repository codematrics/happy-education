import { compareHash } from "@/lib/bcrypt";
import connect from "@/lib/db";
import { assignJWT } from "@/lib/jwt";
import { validateSchema } from "@/lib/schemaValidator";
import { noAuthMiddleware } from "@/middlewares/authMiddleware";
import { User } from "@/models/User";
import { LoginUserFormData, loginUserValidations } from "@/types/schema";
import { response } from "@/utils/response";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const postController = async (req: NextRequest) => {
  try {
    const body = await req.json();

    validateSchema(loginUserValidations, body);

    const { identifier, password }: LoginUserFormData = body;

    await connect();

    const user = await User.findOne({
      $or: [{ email: identifier }, { mobileNumber: identifier }],
    });

    if (!user || !(await compareHash(password, user.password))) {
      return response.error("Invalid credentials", 401);
    }

    const jwt = await assignJWT({ _id: user._id });

    if (!jwt) {
      return response.error("Something Went wrong. Please Try Again!", 500);
    }

    (await cookies()).set("user_token", JSON.stringify(jwt), {
      httpOnly: process.env.NODE_ENV === "production",
    });

    return response.success(null, "You are logged in successfully", 200);
  } catch (error) {
    console.error("Login error:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const POST = async (req: NextRequest) =>
  noAuthMiddleware(req, postController);
