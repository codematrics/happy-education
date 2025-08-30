import { getUserAuthCookie } from "@/utils/cookie";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async () => {
  try {
    const isLoggedIn = await getUserAuthCookie();
    const role =
      (await cookies()).get("user_token")?.value &&
      (await cookies()).get("admin_token")?.value
        ? "both"
        : (await cookies()).get("user_token")?.value
        ? "user"
        : (await cookies()).get("admin_token")?.value
        ? "admin"
        : null;

    if (!isLoggedIn) {
      return NextResponse.json(
        { message: "You are not logged in", data: { isLoggedIn, role } },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "You are logged in", data: { isLoggedIn, role } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "You are not logged in", data: null },
      { status: 200 }
    );
  }
};
