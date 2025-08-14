"use server";

import jwt from "jsonwebtoken";

const SECRET = process.env.ADMIN_JWT_SECRET!;
const EXPIRES_IN = "7d";

export const verifyJWT = (token: string): boolean => {
  try {
    jwt.verify(token, SECRET);
    return true;
  } catch (err) {
    return false;
  }
};

export const assignJWT = async (
  payload: string | object
): Promise<string | null> => {
  try {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
  } catch (err) {
    return null;
  }
};
