import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import { Course } from "@/models/Course";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { calculateExpiryDate } from "@/lib/courseAccessMiddleware";
// import Razorpay from "razorpay"; // Install with: npm install razorpay

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
              (pc) => pc.courseId.toString() === courseId
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

    // If not logged in, check if user with email exists
    let existingUser = null;
    if (!isLoggedIn && userEmail) {
      existingUser = await User.findOne({ email: userEmail });
      if (existingUser) {
        userId = existingUser._id.toString();
        
        // Check if existing user already purchased this course
        const alreadyPurchased = existingUser.purchasedCourses.some(
          (pc) => pc.courseId.toString() === courseId
        );

        if (alreadyPurchased) {
          return NextResponse.json(
            {
              data: null,
              message: "This email has already purchased this course",
              status: false,
            },
            { status: 400 }
          );
        }
      }
    }

    // Initialize Razorpay
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID!,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET!,
    // });

    // Create Razorpay order
    const amountInPaise = Math.round(course.price * 100); // Convert to paise
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // For now, simulate Razorpay order creation
    // In real implementation, uncomment below:
    /*
    const orderOptions = {
      amount: amountInPaise,
      currency: course.currency.toUpperCase() === 'DOLLAR' ? 'USD' : 
               course.currency.toUpperCase() === 'RUPEE' ? 'INR' : 'USD',
      receipt: orderId,
      notes: {
        courseId: courseId,
        courseName: course.name,
        userEmail: userEmail || existingUser?.email || '',
        userId: userId || 'guest',
        accessType: course.accessType,
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);
    */

    // Simulated Razorpay order response
    const razorpayOrder = {
      id: orderId,
      amount: amountInPaise,
      currency: course.currency.toUpperCase() === 'DOLLAR' ? 'USD' : 
               course.currency.toUpperCase() === 'RUPEE' ? 'INR' : 'USD',
      receipt: orderId,
      status: 'created',
    };

    // Create pending transaction record
    const transactionData = {
      userId: userId || null,
      courseId: courseId,
      amount: course.price,
      currency: course.currency,
      paymentId: 'pending',
      orderId: razorpayOrder.id,
      status: 'pending' as const,
      paymentGateway: 'razorpay' as const,
      metadata: {
        courseId: courseId,
        courseName: course.name,
        userEmail: userEmail || existingUser?.email || '',
        isGuestCheckout: !isLoggedIn,
        accessType: course.accessType,
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
          userEmail: userEmail || existingUser?.email || '',
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