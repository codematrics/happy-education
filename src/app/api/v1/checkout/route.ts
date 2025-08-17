import { hashValue } from "@/lib/bcrypt";
import connect from "@/lib/db";
import emailSender from "@/lib/emailSender";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { generateSecurePassword } from "@/lib/passwordGenerator";
import { Course } from "@/models/Course";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay"; // Install with: npm install razorpay

export const POST = async (req: NextRequest) => {
  try {
    await connect();

    const { courseId, userEmail } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        {
          data: null,
          message: "Course ID is required",
          status: false,
        },
        { status: 400 }
      );
    }

    // Get course details
    const course = await Course.findById(courseId);
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

    // Check if course is free
    if (course.accessType === "free") {
      return NextResponse.json(
        {
          data: null,
          message: "This course is free, no payment required",
          status: false,
        },
        { status: 400 }
      );
    }

    let userId = null;
    let isLoggedIn = false;

    // Check if user is logged in
    const userToken = req.cookies.get("user_token")?.value;
    if (userToken) {
      try {
        let parsedToken;
        try {
          parsedToken = JSON.parse(userToken);
        } catch {
          parsedToken = userToken;
        }

        if (await verifyJWT(parsedToken)) {
          const decodedToken = await decodeJWT(parsedToken);
          userId = decodedToken._id;
          isLoggedIn = true;

          // Check if user already purchased this course
          const user = await User.findById(userId);
          if (user) {
            const alreadyPurchased = user.purchasedCourses.some(
              (pc) => pc.courseId && pc.courseId.toString() === courseId
            );

            if (alreadyPurchased) {
              return NextResponse.json(
                {
                  data: null,
                  message: "You have already purchased this course",
                  status: false,
                },
                { status: 400 }
              );
            }
          }
        }
      } catch (error) {
        console.log("Token verification failed:", error);
      }
    }

    // If not logged in, require email
    if (!isLoggedIn && !userEmail) {
      return NextResponse.json(
        {
          data: null,
          message: "Email is required for guest checkout",
          status: false,
        },
        { status: 400 }
      );
    }

    // If not logged in, check if user with email exists or create new user
    let existingUser = null;
    let isNewUser = false;

    if (!isLoggedIn && userEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        return NextResponse.json(
          {
            data: null,
            message: "Please provide a valid email address",
            status: false,
          },
          { status: 400 }
        );
      }

      existingUser = await User.findOne({ email: userEmail });

      if (existingUser) {
        // User exists, check if course already purchased
        userId = (existingUser._id as any).toString();
        const alreadyPurchased = existingUser.purchasedCourses.some(
          (pc) => pc.courseId && pc.courseId?.toString() === courseId
        );

        if (alreadyPurchased) {
          return NextResponse.json(
            {
              data: null,
              message:
                "This email has already purchased this course. Please login to access it.",
              status: false,
            },
            { status: 400 }
          );
        }
      } else {
        // Create new user account for guest checkout
        isNewUser = true;

        const generatedPassword = generateSecurePassword();
        const hashedPassword = await hashValue(generatedPassword);

        // Extract name from email or use default
        const emailPrefix = userEmail.split("@")[0];
        const firstName =
          emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

        existingUser = await User.create({
          firstName: firstName,
          lastName: "User",
          email: userEmail,
          password: hashedPassword,
          isVerified: false, // Will be verified after successful purchase
          purchasedCourses: [], // Initialize empty array
        });

        userId = (existingUser._id as any).toString();

        // Send welcome email with credentials (don't await to avoid blocking)
        emailSender
          .sendNewUserPassword(userEmail, generatedPassword, course.name)
          .catch((error: any) => {
            console.error("Failed to send welcome email:", error);
            // Don't fail the checkout if email fails
          });
      }
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create Razorpay order
    const amountInPaise = Math.round(course.price * 100); // Convert to paise
    const orderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // For now, simulate Razorpay order creation
    // In real implementation, uncomment below:
    const orderOptions = {
      amount: amountInPaise,
      currency:
        course.currency.toUpperCase() === "DOLLAR"
          ? "USD"
          : course.currency.toUpperCase() === "RUPEE"
          ? "INR"
          : "USD",
      receipt: orderId,
      notes: {
        courseId: courseId,
        courseName: course.name,
        userEmail: userEmail || existingUser?.email || "",
        userId: userId || "guest",
        accessType: course.accessType,
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Simulated Razorpay order response
    // const razorpayOrder = {
    //   id: orderId,
    //   amount: amountInPaise,
    //   currency:
    //     course.currency.toUpperCase() === "DOLLAR"
    //       ? "USD"
    //       : course.currency.toUpperCase() === "RUPEE"
    //       ? "INR"
    //       : "USD",
    //   receipt: orderId,
    //   status: "created",
    // };

    // Create pending transaction record
    const paymentId = `payment_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const transactionData = {
      paymentId: paymentId, // Ensure a valid paymentId is generated
      userId: userId, // We now always have a userId (either logged in or created)
      courseId: courseId,
      amount: course.price,
      currency: course.currency,
      orderId: razorpayOrder.id,
      status: "pending" as const,
      paymentGateway: "razorpay" as const,
      metadata: {
        courseId: courseId,
        courseName: course.name,
        userEmail: userEmail || existingUser?.email || "",
        isGuestCheckout: !isLoggedIn,
        isLoggedIn: isLoggedIn,
        accessType: course.accessType,
        isNewUser: isNewUser, // Track if this was a newly created user
      },
    };

    const transaction = await Transaction.createTransaction(transactionData);

    // Return order details for frontend
    return NextResponse.json(
      {
        data: {
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
          userEmail: userEmail || existingUser?.email || "",
          isLoggedIn,
        },
        message: "Order created successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating checkout order:", error);
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
