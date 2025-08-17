import connect from "@/lib/db";
import {
  createReceiptData,
  generateReceiptHTML,
  getReceiptFromCloudinary,
} from "@/lib/pdfGenerator";
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
    const token = req.nextUrl.searchParams.get("token");

    if (!transactionId || !token) {
      return NextResponse.json(
        {
          data: null,
          message: "Transaction ID and token are required",
          status: false,
        },
        { status: 400 }
      );
    }

    // Find the transaction
    const transaction = await Transaction.findById(transactionId)
      .populate("courseId")
      .populate("userId");

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

    // Verify the access token
    const expectedToken = generateReceiptToken(
      transactionId,
      transaction.orderId
    );
    if (token !== expectedToken) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid access token",
          status: false,
        },
        { status: 403 }
      );
    }

    // Get course and user details
    const course = transaction.courseId as any;
    const user = transaction.userId as any;

    if (!course || !user) {
      return NextResponse.json(
        {
          data: null,
          message: "Transaction data incomplete",
          status: false,
        },
        { status: 400 }
      );
    }

    // Try to get receipt from Cloudinary first
    let receiptHTML = null;
    if (transaction.receipt?.publicId) {
      receiptHTML = await getReceiptFromCloudinary(
        transaction.receipt.publicId
      );
    }

    // If not found in Cloudinary, generate new receipt
    if (!receiptHTML) {
      const receiptData = createReceiptData(transaction, course, user);
      receiptHTML = generateReceiptHTML(receiptData);
    }

    // Check if user wants JSON response (for frontend to handle PDF generation)
    const format = req.nextUrl.searchParams.get("format");

    if (format === "json") {
      return NextResponse.json(
        {
          data: {
            receiptHTML,
            transaction: {
              id: transaction._id,
              orderId: transaction.orderId,
              paymentId: transaction.paymentId,
              amount: transaction.amount,
              currency: transaction.currency,
              status: transaction.status,
              createdAt: transaction.createdAt,
            },
            course: {
              id: course._id,
              name: course.name,
              price: course.price,
              accessType: course.accessType,
            },
            user: {
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
            },
          },
          message: "Receipt data generated successfully",
          status: true,
        },
        { status: 200 }
      );
    }

    // Return HTML for direct PDF conversion
    return new NextResponse(receiptHTML, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename=receipt-${transaction.orderId}.html`,
      },
    });
  } catch (error) {
    console.error("Error generating receipt:", error);
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

// Note: generateReceiptToken is used internally only
