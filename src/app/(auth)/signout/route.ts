import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    // Clear user authentication cookies
    const cookieStore = await cookies();

    // Clear all user-related cookies
    cookieStore.delete("user_token");
    cookieStore.delete("user_otp_token");
    cookieStore.delete("user_data");
    cookieStore.delete("user_forgot_pass_token");

    return NextResponse.json(
      {
        data: null,
        message: "Logged out successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("error while signout", err);
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
