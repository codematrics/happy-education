"use server";

import { IUser } from "@/models/User";
import { Admin, User } from "@/types/types";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET = process.env.ADMIN_JWT_SECRET!;
const EXPIRES_IN = "7d";

export const verifyJWT = async (token: string): Promise<boolean> => {
  try {
    await jwt.verify(token, SECRET);
    return true;
  } catch {
    return false;
  }
};

export const assignJWT = async (
  payload: string | object
): Promise<string | null> => {
  try {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
  } catch {
    return null;
  }
};

export const decodeJWT = async <T = any>(token: string): Promise<T | null> => {
  try {
    const decoded = jwt.decode(token) as T | null;
    return decoded;
  } catch {
    return null;
  }
};

export const assignUserToken = async (data: IUser) => {
  const { password, purchasedCourses, transactions, ...rest } = data;
  const token = await assignJWT(rest);

  (await cookies()).set("user_token", JSON.stringify(token), {
    httpOnly: process.env.NODE_ENV === "production",
  });
};

export const getUserDataFromToken = async (req: NextRequest) => {
  try {
    const raw = (await cookies()).get("user_token")?.value;
    if (!raw) return null;

    const token = JSON.parse(raw);
    if (!token) return null;

    const isValid = await verifyJWT(token);
    if (!isValid) return null;

    const decoded = await decodeJWT<User>(token);
    return decoded;
  } catch (err) {
    console.error("Failed to parse or verify user token:", err);
    return null;
  }
};

export const getAdminDataFromToken = async (req: NextRequest) => {
  try {
    const raw = (await cookies()).get("admin_token")?.value;
    if (!raw) return null;

    const token = JSON.parse(raw);
    if (!token) return null;

    const isValid = await verifyJWT(token);
    if (!isValid) return null;

    const decoded = await decodeJWT<Admin>(token);
    return decoded;
  } catch (err) {
    console.error("Failed to parse or verify user token:", err);
    return null;
  }
};
