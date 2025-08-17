import crypto from "crypto";

/**
 * Generate a secure token for receipt access
 */
export function generateReceiptToken(transactionId: string, orderId: string): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback-secret";
  const payload = `${transactionId}:${orderId}`;
  
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .substring(0, 32); // Use first 32 characters for shorter URLs
}

/**
 * Generate a public receipt URL
 */
export function generateReceiptURL(transactionId: string, orderId: string, format: "html" | "json" = "html"): string {
  const token = generateReceiptToken(transactionId, orderId);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const params = new URLSearchParams({ token });
  
  if (format === "json") {
    params.set("format", "json");
  }
  
  return `${baseUrl}/api/v1/receipt/${transactionId}?${params.toString()}`;
}