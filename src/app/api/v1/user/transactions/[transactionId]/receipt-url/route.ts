import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { Transaction } from "@/models/Transaction";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) => {
  try {
    await connect();

    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json(
        {
          data: null,
          message: "Transaction ID is required",
          status: false,
        },
        { status: 400 }
      );
    }

    // Try to get user token from cookies or Authorization header
    let userToken = req.cookies.get("user_token")?.value;

    // If no cookie, try Authorization header
    if (!userToken) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        userToken = authHeader.substring(7);
      }
    }

    if (!userToken) {
      return NextResponse.json(
        {
          data: null,
          message: "Authentication required",
          status: false,
        },
        { status: 401 }
      );
    }

    // Parse and verify token
    let parsedToken;
    try {
      parsedToken = userToken;
    } catch {
      parsedToken = userToken;
    }

    const isTokenValid = await verifyJWT(parsedToken);
    if (!isTokenValid) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid authentication token",
          status: false,
        },
        { status: 401 }
      );
    }

    const decodedToken = await decodeJWT(parsedToken);
    const userId = decodedToken._id;

    // Find the transaction and verify ownership
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return NextResponse.json(
        {
          data: null,
          message: "Transaction not found",
          status: false,
        },
        { status: 404 }
      );
    }

    // Verify the transaction belongs to the authenticated user
    if (transaction.userId.toString() !== userId) {
      return NextResponse.json(
        {
          data: null,
          message: "Access denied",
          status: false,
        },
        { status: 403 }
      );
    }

    // Only allow receipt generation for successful transactions
    if (transaction.status !== "success") {
      return NextResponse.json(
        {
          data: null,
          message: "Receipt is only available for successful transactions",
          status: false,
        },
        { status: 400 }
      );
    }

    // Generate receipt access token
    const receiptToken = generateReceiptToken(
      transactionId,
      transaction.orderId
    );
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

    const receiptUrl = `${baseUrl}/api/v1/receipt/${transactionId}?token=${receiptToken}`;
    const receiptJsonUrl = `${baseUrl}/api/v1/receipt/${transactionId}?token=${receiptToken}&format=json`;

    return NextResponse.json(
      {
        data: {
          receiptUrl,
          receiptJsonUrl,
          transactionId,
          orderId: transaction.orderId,
        },
        message: "Receipt URL generated successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating receipt URL:", error);
    return NextResponse.json(
      {
        data: null,
        message: "Internal Server Error",
        status: false,
      },
      { status: 500 }
    );
  }
};

/**
 * Generate a secure token for receipt access
 */
function generateReceiptToken(transactionId: string, orderId: string): string {
  const secret =
    process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback-secret";
  const payload = `${transactionId}:${orderId}`;

  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .substring(0, 32); // Use first 32 characters for shorter URLs
}
