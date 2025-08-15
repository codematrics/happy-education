import { compareHash } from "@/lib/bcrypt";
import connect from "@/lib/db";
import { assignJWT } from "@/lib/jwt";
import { validateSchema } from "@/lib/schemaValidator";
import { User } from "@/models/User";
import { LoginUserFormData, loginUserValidations } from "@/types/schema";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    validateSchema(loginUserValidations, body);

    const { identifier, password }: LoginUserFormData = body;

    await connect();

    const user = await User.findOne({
      $or: [{ email: identifier }, { mobileNumber: identifier }],
    });

    if (!user || !(await compareHash(password, user.password))) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid username or password",
          status: false,
        },
        { status: 401 }
      );
    }

    const jwt = await assignJWT({ _id: user._id });

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

    (await cookies()).set("user_token", JSON.stringify(jwt), {
      httpOnly: process.env.NODE_ENV === "production",
    });

    return NextResponse.json(
      {
        data: null,
        message: "You are logged in successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
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
