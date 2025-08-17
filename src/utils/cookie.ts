"use server";

import { cookies } from "next/headers";

export const getUserAuthCookie = async () => {
  return (await cookies()).get("user_token")?.value;
};
