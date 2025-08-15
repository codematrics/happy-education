"use server";
import bcrypt from "bcryptjs";

export const compareHash = async (value: string, hashValue: string) => {
  return await bcrypt.compare(value, hashValue);
};

export const hashValue = async (value: string) => {
  const salt = await bcrypt.genSalt(
    parseInt(process.env.BCRYPT_HASH as string)
  );
  return await bcrypt.hash(value, salt);
};
