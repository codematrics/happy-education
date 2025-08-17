import { calculateExpiryDate } from "@/lib/courseAccessMiddleware";
import connect from "@/lib/db";
import { assignJWT } from "@/lib/jwt";
import { generateUserPassword } from "@/lib/passwordGenerator";
import {
  createReceiptData,
  generateReceiptHTML,
  saveReceiptToCloudinary,
} from "@/lib/pdfGenerator";
import { Course } from "@/models/Course";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
// import { sendNewUserPassword, sendPurchaseConfirmation } from "@/lib/emailSender";
import bcrypt from "bcryptjs";
import crypto from "crypto";
// import Razorpay from "razorpay"; // Install with: npm install razorpay

export const POST = async (req: NextRequest) => {
  try {
    await connect();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userEmail,
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        {
          data: null,
          message: "Missing payment verification parameters",
          status: false,
        },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid payment signature",
          status: false,
        },
        { status: 400 }
      );
    }

    // Find the pending transaction
    const transaction = await Transaction.findByOrderId(razorpay_order_id);
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

    // Get course details
    const course = await Course.findById(transaction.courseId);
    if (!course) {
      return NextResponse.json(
        {
          data: null,
          message: "Course not found",
          status: false,
        },
        { status: 404 }
      );
    }

    let user = null;
    let isNewUser = false;

    // Handle user logic
    if (transaction.userId) {
      // User was logged in during checkout
      user = await User.findById(transaction.userId);
    } else {
      // Guest checkout - find or create user
      const email = userEmail || transaction.metadata?.userEmail;
      if (!email) {
        throw new Error("User email not found");
      }

      user = await User.findOne({ email });

      if (!user) {
        // Create new user
        isNewUser = true;
        const password = generateUserPassword();
        const hashedPassword = await bcrypt.hash(password, 12);

        user = await User.create({
          firstName: email.split("@")[0], // Use part of email as firstName
          lastName: "User",
          email: email,
          password: hashedPassword,
          isVerified: true, // Auto-verify users created via payment
          purchasedCourses: [],
          transactions: [],
        });

        // Send password email to new user
        // Uncomment when email functionality is available:
        /*
        try {
          await sendNewUserPassword(email, password, course.name);
        } catch (emailError) {
          console.error("Failed to send password email:", emailError);
          // Don't fail the transaction for email issues
        }
        */

        console.log(`New user created: ${email}, password: ${password}`);
      }
    }

    if (!user) {
      throw new Error("Failed to find or create user");
    }

    // Calculate expiry date based on course access type
    const purchaseDate = new Date();
    const expiryDate = calculateExpiryDate(course.accessType, purchaseDate);

    // Add course to user's purchased courses
    const purchaseExists = user.purchasedCourses.some(
      (pc) => pc.courseId.toString() === course?._id?.toString()
    );

    if (!purchaseExists && course?._id) {
      user.purchasedCourses.push({
        courseId: course?._id as any,
        purchaseDate,
        expiryDate,
      });
    }

    // Add transaction to user's transactions
    user.transactions.push(transaction?._id as any);
    await user.save();

    // Update transaction status
    transaction.status = "success";
    transaction.paymentId = razorpay_payment_id;
    transaction.userId = user?._id as any; // Ensure userId is set for guest checkouts
    transaction.metadata = {
      ...transaction.metadata,
      paymentVerifiedAt: new Date(),
      isNewUser,
      expiryDate,
    };
    await transaction.save();

    // Generate and save receipt to Cloudinary
    try {
      const receiptData = createReceiptData(transaction, course, user);
      const receiptHTML = generateReceiptHTML(receiptData);
      const cloudinaryResult = await saveReceiptToCloudinary(
        receiptHTML,
        transaction.orderId
      );

      if (cloudinaryResult) {
        transaction.receipt = {
          publicId: cloudinaryResult.publicId,
          url: cloudinaryResult.url,
          generatedAt: new Date(),
        };
        await transaction.save();
        console.log(`Receipt saved to Cloudinary: ${cloudinaryResult.url}`);
      } else {
        console.warn(
          `Failed to save receipt to Cloudinary for transaction ${transaction._id}`
        );
      }
    } catch (receiptError) {
      console.error("Error generating/saving receipt:", receiptError);
      // Don't fail the transaction if receipt generation fails
    }

    // Send purchase confirmation email
    // Uncomment when email functionality is available:
    /*
    try {
      await sendPurchaseConfirmation(
        user.email,
        course.name,
        transaction.amount,
        transaction.currency,
        transaction.orderId
      );
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the transaction for email issues
    }
    */

    console.log(`Purchase confirmed: ${user.email} bought ${course.name}`);

    // Create login token for new users or if user wasn't logged in
    let userToken = null;
    const wasGuestCheckout = !transaction.metadata?.isLoggedIn;

    if (wasGuestCheckout || isNewUser) {
      // Create JWT token for auto-login
      userToken = await assignJWT({
        _id: user._id?.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      });
    }

    const response = NextResponse.json(
      {
        data: {
          transactionId: transaction._id,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          course: {
            id: course?._id,
            name: course.name,
            accessType: course.accessType,
          },
          user: {
            id: user?._id,
            email: user.email,
            isNewUser,
            wasGuestCheckout,
          },
          access: {
            purchaseDate,
            expiryDate,
            hasLifetimeAccess: course.accessType === "lifetime",
          },
          autoLogin: wasGuestCheckout || isNewUser,
        },
        message: isNewUser
          ? "Payment successful! Account created and course access granted. You have been automatically logged in."
          : wasGuestCheckout
          ? "Payment successful! Course access granted. You have been automatically logged in."
          : "Payment successful! Course access granted.",
        status: true,
      },
      { status: 200 }
    );

    // Set authentication cookie if auto-login is needed
    if (userToken && (wasGuestCheckout || isNewUser)) {
      response.cookies.set("user_token", JSON.stringify(userToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Error verifying payment:", error);

    // Try to update transaction status to failed
    try {
      if (req.body && (req.body as any).razorpay_order_id) {
        const failedTransaction = await Transaction.findByOrderId(
          (req.body as any).razorpay_order_id
        );
        if (failedTransaction) {
          failedTransaction.status = "failed";
          failedTransaction.metadata = {
            ...failedTransaction.metadata,
            errorAt: new Date(),
            error: error instanceof Error ? error.message : "Unknown error",
          };
          await failedTransaction.save();
        }
      }
    } catch (updateError) {
      console.error("Failed to update transaction status:", updateError);
    }

    return NextResponse.json(
      {
        data: null,
        message: "Payment verification failed",
        status: false,
      },
      { status: 500 }
    );
  }
};

/**
 * Verify Razorpay webhook signature
 */
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("Razorpay key secret not configured");
      return false;
    }

    const payload = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("Error verifying Razorpay signature:", error);
    return false;
  }
}

// Webhook endpoint for Razorpay events
export const PATCH = async (req: NextRequest) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers.get("x-razorpay-signature");

    if (!webhookSecret || !signature) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.text();

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case "payment.captured":
        // Payment was successful
        console.log("Payment captured:", event.payload.payment.entity);
        break;

      case "payment.failed":
        // Payment failed
        console.log("Payment failed:", event.payload.payment.entity);
        await handleFailedPayment(event.payload.payment.entity);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
};

async function handleFailedPayment(paymentEntity: any) {
  try {
    await connect();

    const transaction = await Transaction.findByOrderId(paymentEntity.order_id);
    if (transaction) {
      transaction.status = "failed";
      transaction.metadata = {
        ...transaction.metadata,
        failureReason: paymentEntity.error_description,
        failedAt: new Date(),
      };
      await transaction.save();
    }
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}
