"use server";

import { IUser } from "@/models/User";
import { Admin, User } from "@/types/types";
import * as jose from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;
const EXPIRES_IN = "7d";

const getSecretKey = (): Uint8Array | any =>
  new TextEncoder().encode(JWT_SECRET);

export const assignJWTJose = async (
  payload: string | object
): Promise<string | null> => {
  try {
    const token = await new jose.SignJWT(
      typeof payload === "string"
        ? ({ data: payload } as jose.JWTPayload)
        : (payload as jose.JWTPayload)
    )
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(EXPIRES_IN)
      .sign(getSecretKey());

    return token;
  } catch (err) {
    console.error("JWT signing failed:", err);
    return null;
  }
};

export const verifyJWTJose = async (
  token: string,
  isAdmin: boolean = false
): Promise<boolean> => {
  try {
    const { payload, protectedHeader } = await jose.jwtVerify(
      token,
      getSecretKey(),
      {
        algorithms: ["HS256"],
      }
    );

    console.log("JWT verified:", { payload, protectedHeader });
    return true;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return false;
  }
};

export const decodeJWTJose = async <T = any>(
  token: string
): Promise<T | null> => {
  try {
    const decoded = jose.decodeJwt(token) as T | null;
    return decoded;
  } catch {
    return null;
  }
};

export const assignUserTokenJose = async (data: IUser) => {
  const { password, purchasedCourses, transactions, ...rest } = data;
  const token = await assignJWTJose(rest);

  (await cookies()).set("user_token", token || "", {
    httpOnly: process.env.NODE_ENV === "production",
  });
};

export const getUserDataFromTokenJose = async (req: NextRequest) => {
  try {
    const raw = (await cookies()).get("user_token")?.value;
    if (!raw) return null;

    const token = raw;
    if (!token) return null;

    const isValid = await verifyJWTJose(token);
    if (!isValid) return null;

    const decoded = await decodeJWTJose<User>(token);
    return decoded;
  } catch (err) {
    console.error("Failed to parse or verify user token:", err);
    return null;
  }
};

export const getAdminDataFromTokenJose = async (req: NextRequest) => {
  try {
    const raw = (await cookies()).get("admin_token")?.value;
    if (!raw) return null;

    const token = raw;
    if (!token) return null;

    const isValid = await verifyJWTJose(token);
    if (!isValid) return null;

    const decoded = await decodeJWTJose<Admin>(token);
    return decoded;
  } catch (err) {
    console.error("Failed to parse or verify admin token:", err);
    return null;
  }
};
