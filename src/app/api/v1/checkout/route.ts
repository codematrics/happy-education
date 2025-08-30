import { hashValue } from "@/lib/bcrypt";
import connect from "@/lib/db";
import emailSender from "@/lib/emailSender";
import { generateSecurePassword } from "@/lib/passwordGenerator";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Course } from "@/models/Course";
import { Transaction } from "@/models/Transaction";
import { IUser, User } from "@/models/User";
import { CourseCurrency, Roles } from "@/types/constants";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const postController = async (
  req: NextRequest,
  { user, admin }: { user?: IUser; admin?: Admin }
): Promise<NextResponse> => {
  try {
    await connect();

    const { courseId, userEmail } = await req.json();

    if (!courseId) {
      return response.error("Course ID is required", 400);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return response.error(
        "There is no course related to your selection!",
        404
      );
    }

    if (course.accessType === "free") {
      return response.error("This course is free, no payment required", 400);
    }

    let purchasingUser: IUser | null | undefined = user;
    let isNewUser = false;

    if (purchasingUser) {
      const alreadyPurchased = purchasingUser.purchasedCourses.some(
        (pc) => pc.courseId?.toString() === courseId
      );
      if (alreadyPurchased) {
        return response.error("You have already purchased this course", 400);
      }
    } else {
      if (!userEmail) {
        return response.error(
          "Please provide your email to purchase this course",
          400
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        return response.error("Invalid email address", 400);
      }

      const existingUser = await User.findOne({ email: userEmail });

      if (existingUser) {
        const alreadyPurchased = existingUser.purchasedCourses.some(
          (pc) => pc.courseId?.toString() === courseId
        );

        if (alreadyPurchased) {
          return response.error("You have already purchased this course", 400);
        }

        // Allow guest retry
        purchasingUser = existingUser;
        isNewUser = false;
      } else {
        const generatedPassword = generateSecurePassword();
        const hashedPassword = await hashValue(generatedPassword);

        const emailPrefix = userEmail.split("@")[0];
        const firstName =
          emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

        purchasingUser = await User.create({
          firstName,
          lastName: "User",
          email: userEmail,
          password: hashedPassword,
          isVerified: false,
          purchasedCourses: [],
        });

        isNewUser = true;

        emailSender
          .sendNewUserPassword(userEmail, generatedPassword, course.name)
          .then(() => {
            console.log("Email Sent successfully");
          })
          .catch((error: any) => {
            console.error("Failed to send welcome email:", error);
          });
      }
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const amountInPaise = Math.round(course.price * 100);
    const orderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const orderOptions = {
      amount: amountInPaise,
      currency:
        course.currency === CourseCurrency.dollar
          ? "USD"
          : course.currency === CourseCurrency.rupee
          ? "INR"
          : "USD",
      receipt: orderId,
      notes: {
        courseId,
        courseName: course.name,
        userEmail: userEmail || purchasingUser?.email || "",
        userId: purchasingUser?._id?.toString() || "guest",
        accessType: course.accessType,
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    const paymentId = `payment_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const transactionData = {
      paymentId,
      userId: purchasingUser?._id as Types.ObjectId,
      courseId,
      amount: course.price,
      currency: course.currency,
      orderId: razorpayOrder.id,
      status: "pending" as const,
      paymentGateway: "razorpay" as const,
      metadata: {
        courseId,
        courseName: course.name,
        userEmail: userEmail || purchasingUser?.email || "",
        isGuestCheckout: !user,
        isLoggedIn: !!user,
        accessType: course.accessType,
        isNewUser,
      },
    };

    const transaction = await Transaction.createTransaction(transactionData);

    return response.success(
      {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        course: {
          id: course._id,
          name: course.name,
          price: course.price,
          currency: course.currency,
          accessType: course.accessType,
        },
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        transactionId: transaction._id,
        userEmail: userEmail || purchasingUser?.email || "",
        isLoggedIn: !!user,
      },
      "Order created successfully",
      200
    );
  } catch (error) {
    console.error("Error creating checkout order:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const POST = async (req: NextRequest) =>
  await authMiddleware(req, [Roles.user], postController, true);
