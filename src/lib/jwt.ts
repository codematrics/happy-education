"use server";

import jwt from "jsonwebtoken";

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
