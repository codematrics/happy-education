import {
  getAdminDataFromTokenJose,
  getUserDataFromTokenJose,
} from "@/lib/jose";
import { getAdminDataFromToken, getUserDataFromToken } from "@/lib/jwt";
import { IUser, User } from "@/models/User";
import { Roles } from "@/types/constants";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const authMiddleware = async (
  req: NextRequest,
  requiredRoles: Roles[] = [],
  controller: (
    req: NextRequest,
    context: { user?: IUser; admin?: Admin }
  ) => Promise<NextResponse>,
  optional: boolean = false
) => {
  try {
    const userToken = await getUserDataFromTokenJose(req);
    const adminToken = await getAdminDataFromTokenJose(req);

    const needsUser = requiredRoles.includes(Roles.user);
    const needsAdmin = requiredRoles.includes(Roles.admin);

    if (!userToken && !adminToken && optional) {
      return controller(req, {}); // ← no user/admin
    }

    if (!userToken && !adminToken && !optional) {
      return unauthorizedResponse();
    }

    if (userToken) {
      if (needsAdmin && !needsUser && !optional) {
        return unauthorizedResponse();
      }

      const user = await User.findById(userToken._id).lean();
      if (!user || user.isBlocked) {
        return unauthorizedResponse();
      }

      return controller(req, { user });
    }

    if (adminToken) {
      if (needsUser && !needsAdmin && !optional) {
        return unauthorizedResponse();
      }

      return controller(req, { admin: adminToken });
    }

    return unauthorizedResponse();
  } catch (err) {
    console.error("auth middleware error", err);
    const cookieStore = await cookies();
    cookieStore.delete("user_token");
    cookieStore.delete("admin_token");
    return unauthorizedResponse();
  }
};

export const noAuthMiddleware = async (
  req: NextRequest,
  controller: (req: NextRequest) => Promise<NextResponse>
) => {
  try {
    const userToken = await getUserDataFromToken(req);
    const adminToken = await getAdminDataFromToken(req);

    if (userToken || adminToken) {
      return response.error(
        "You are not authorized to access this. Please logout first.",
        401
      );
    }

    return controller(req);
  } catch (err) {
    console.error("noAuthMiddleware error:", err);

    const cookieStore = await cookies();
    cookieStore.delete("user_token");
    cookieStore.delete("admin_token");

    return controller(req);
  }
};

const unauthorizedResponse = () =>
  response.error(
    "You are not authorized to access this. Please login first.",
    401
  );
