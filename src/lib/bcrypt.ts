"use server";
import bcrypt from "bcryptjs";

export const compareHash = async (value: string, hashValue: string) => {
  return await bcrypt.compare(value, hashValue);
};
