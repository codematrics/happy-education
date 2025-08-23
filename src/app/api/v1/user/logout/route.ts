import { noAuthMiddleware } from "@/middlewares/authMiddleware";
import { response } from "@/utils/response";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const postController = async () => {
  try {
    // Clear user authentication cookies
    const cookieStore = await cookies();

    // Clear all user-related cookies
    cookieStore.delete("user_token");
    cookieStore.delete("user_otp_token");
    cookieStore.delete("user_forgot_pass_token");

    return response.success(null, "Logged out successfully", 200);
  } catch (error) {
    console.error("Logout error:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const POST = async (req: NextRequest) =>
  noAuthMiddleware(req, postController);
