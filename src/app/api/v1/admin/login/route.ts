import { assignJWT } from "@/lib/jwt";
import { LoginAdminFormData, loginAdminValidations } from "@/types/schema";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const validation = loginAdminValidations.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid input",
          status: false,
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { userName, password }: LoginAdminFormData = validation.data;

    if (
      userName !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASS
    ) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid username or password",
          status: false,
        },
        { status: 401 }
      );
    }

    const jwt = await assignJWT({
      _id: process.env.ADMIN_USERNAME,
      isAdmin: true,
    });

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

    (await cookies()).set("admin_token", JSON.stringify(jwt), {
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
