import { calculateExpiryDate } from "@/lib/courseAccessMiddleware";
import connect from "@/lib/db";
import {
  createReceiptData,
  generateReceiptHTML,
  saveReceiptToCloudinary,
} from "@/lib/pdfGenerator";
import { Course } from "@/models/Course";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import { response } from "@/utils/response";
import crypto from "crypto";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/* -------------------- Razorpay Signature Verification -------------------- */
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(orderId + "|" + paymentId)
      .digest("hex");
    return expectedSignature === signature;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

/* -------------------- Main Payment Verification -------------------- */
const postController = async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connect();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userEmail,
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return response.error("Missing payment verification parameters", 400);
    }

    if (
      !verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )
    ) {
      return response.error("Invalid payment signature", 400);
    }

    const transaction = await Transaction.findByOrderId(razorpay_order_id);
    if (!transaction) return response.error("Transaction not found", 404);

    const course = await Course.findById(transaction.courseId);
    if (!course) return response.error("Course not found", 404);

    let user = await User.findById(transaction.userId);

    if (!user) {
      if (!userEmail) return response.error("User email not found", 400);
      user = await User.findOne({ email: userEmail });
      if (!user) return response.error("User not found", 404);
    }

    const purchaseDate = new Date();
    const expiryDate = calculateExpiryDate(course.accessType, purchaseDate);

    if (
      !user.purchasedCourses.some(
        (pc) => pc.courseId.toString() === course?._id?.toString()
      )
    ) {
      user.purchasedCourses.push({
        courseId: course?._id as Types.ObjectId,
        purchaseDate,
        expiryDate,
      });
    }

    user.transactions.push(transaction?._id as any);
    await user.save();

    transaction.status = "success";
    transaction.paymentId = razorpay_payment_id;
    transaction.metadata = {
      ...transaction.metadata,
      paymentVerifiedAt: new Date(),
      expiryDate,
    };
    await transaction.save();

    const receiptData = createReceiptData(transaction, course, user);
    const receiptHTML = generateReceiptHTML(receiptData);
    const cloudinaryReceipt = await saveReceiptToCloudinary(
      receiptHTML,
      transaction.orderId
    );

    if (cloudinaryReceipt) {
      transaction.receipt = {
        publicId: cloudinaryReceipt.publicId,
        url: cloudinaryReceipt.url,
        generatedAt: new Date(),
      };
      await transaction.save();
    }

    return response.success(
      {
        transactionId: transaction._id,
        paymentId: razorpay_payment_id,
        course: {
          id: course._id,
          name: course.name,
          accessType: course.accessType,
        },
        user: {
          id: user._id,
          email: user.email,
        },
        access: {
          purchaseDate,
          expiryDate,
          hasLifetimeAccess: course.accessType === "lifetime",
        },
      },
      "Payment successful! Course access granted.",
      200
    );
  } catch (err) {
    console.error("Payment verification error:", err);
    return response.error("Payment verification failed", 500);
  }
};

export const POST = (req: NextRequest): Promise<NextResponse> =>
  postController(req);
