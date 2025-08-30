import { decodeJWT } from "@/lib/jwt";
import { User } from "@/models/User";
import { getUserAuthCookie } from "@/utils/cookie";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async () => {
  try {
    const isLoggedIn = await getUserAuthCookie();
    const userToken = (await cookies()).get("user_token")?.value;
    const adminToken = (await cookies()).get("admin_token")?.value;
    const role =
      userToken && adminToken
        ? "both"
        : userToken
        ? "user"
        : adminToken
        ? "admin"
        : null;

    if ((role === "user" || role === "both") && userToken) {
      const decoded = await decodeJWT(userToken);
      const user = await User.findById(decoded._id);
      if (user) {
        const { password, ...rest } = user;
        await (await cookies()).set("user_data", JSON.stringify(rest));
      }
    }

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
