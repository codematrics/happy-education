import connect from "@/lib/db";
import {
  createReceiptData,
  generateReceiptHTML,
  getReceiptFromCloudinary,
} from "@/lib/pdfGenerator";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Transaction } from "@/models/Transaction";
import { IUser } from "@/models/User";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const getController = async (
  req: NextRequest,
  {
    transactionId,
    admin,
    user,
  }: {
    transactionId: string;
    user?: IUser;
    admin?: Admin;
  }
) => {
  try {
    await connect();

    const token = req.nextUrl.searchParams.get("token");
    const format = req.nextUrl.searchParams.get("format");

    if (!transactionId || !token) {
      return response.error("Transaction ID and token are required", 400);
    }

    const transaction = await Transaction.findById(transactionId)
      .populate("courseId")
      .populate("userId");

    if (!transaction) {
      return response.error("Transaction not found", 404);
    }

    if (transaction.status !== "success") {
      return response.error(
        "Receipt is only available for successful transactions",
        400
      );
    }

    const expectedToken = generateReceiptToken(
      transactionId,
      transaction.orderId
    );
    if (token !== expectedToken) {
      return response.error("Invalid access token", 403);
    }

    const course = transaction.courseId as any;
    const transactionUser = transaction.userId as any;

    if (!course || !transactionUser) {
      return response.error("Transaction data incomplete", 400);
    }

    let receiptHTML = transaction.receipt?.publicId
      ? await getReceiptFromCloudinary(transaction.receipt.publicId)
      : null;

    if (!receiptHTML) {
      const receiptData = createReceiptData(transaction, course, transactionUser);
      receiptHTML = generateReceiptHTML(receiptData);
    }

    if (format === "json") {
      return response.success(
        {
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
            id: transactionUser._id,
            name: `${transactionUser.firstName} ${transactionUser.lastName}`,
            email: transactionUser.email,
          },
        },
        "Receipt data generated successfully",
        200
      );
    }

    return new NextResponse(receiptHTML, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename=receipt-${transaction.orderId}.html`,
      },
    });
  } catch (error) {
    console.error("Error generating receipt:", error);
    return response.error("Internal Server Error", 500);
  }
};

function generateReceiptToken(transactionId: string, orderId: string): string {
  const secret =
    process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback-secret";

  return crypto
    .createHmac("sha256", secret)
    .update(`${transactionId}:${orderId}`)
    .digest("hex")
    .substring(0, 32);
}


export const GET = (
  req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) =>
  authMiddleware(req, [], async (r, context) => {
    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json(
        { error: "Please provide a valid transactionId" },
        { status: 400 }
      );
    }

    return getController(r, {
      transactionId,
      admin: context.admin,
      user: context.user,
    });
  });