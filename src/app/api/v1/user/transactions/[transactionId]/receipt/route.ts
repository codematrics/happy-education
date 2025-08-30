import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { createReceiptData, generateReceiptHTML } from "@/lib/pdfGenerator";
import { Transaction } from "@/models/Transaction";
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
    let userId = null;

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
    userId = decodedToken._id;

    // Find the transaction and verify ownership
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

    // Verify the transaction belongs to the authenticated user
    if (transaction.userId._id.toString() !== userId) {
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

    // Create receipt data
    const receiptData = createReceiptData(transaction, course, user);

    // Generate HTML receipt
    const receiptHTML = generateReceiptHTML(receiptData);

    // Check if user wants JSON response (for frontend to handle PDF generation)
    const format = req.nextUrl.searchParams.get("format");

    if (format === "json") {
      return NextResponse.json(
        {
          data: {
            receiptHTML,
            receiptData,
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
