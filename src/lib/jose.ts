import * as jose from "jose";

export const verifyJWTJose = async (
  token: string,
  isAdmin: boolean = false
): Promise<boolean> => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || ""); // same as JWT_SECRET
    console.log("Verifying JWT:", {
      isAdmin,
      tokenLength: token?.length,
    });

    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"], // must match what you used when signing
    });

    console.log("JWT verification result:", payload);
    return true;
  } catch (error) {
    console.log("JWT verification failed:", error);
    return false;
  }
};
