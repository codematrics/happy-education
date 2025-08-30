import connect from "@/lib/db";
import { Event } from "@/models/Events";
import { CourseCurrency } from "@/types/constants";
import { response } from "@/utils/response";
import { NextRequest } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, amount, currency, userDetails } = body;

    // Validate required fields
    if (!eventId || !amount || !userDetails) {
      return response.error("Missing required fields", 400);
    }

    // Validate user details
    const { firstName, lastName, email, phone } = userDetails;
    if (!firstName || !lastName || !email || !phone) {
      return response.error("Complete user details required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response.error("Invalid email format", 400);
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return response.error("Invalid phone number format", 400);
    }

    await connect();

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return response.error("Event not found", 404);
    }

    // Verify amount matches event amount
    if (amount !== event.amount) {
      return response.error("Amount mismatch", 400);
    }

    // Convert amount to paise for Razorpay
    const amountInPaise = Math.round(amount * 100);

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const orderOptions = {
      amount: amountInPaise,
      currency:
        currency === CourseCurrency.dollar
          ? "USD"
          : currency === CourseCurrency.rupee
          ? "INR"
          : "USD",
      receipt: `${eventId}_${Date.now()}`,
      notes: {
        eventId: eventId,
        eventName: event.name,
        userEmail: email,
        userName: `${firstName} ${lastName}`,
        userPhone: phone,
      },
    };

    // Create Razorpay order
    const order = await razorpay.orders.create(orderOptions);

    return response.success(
      {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      "Payment order created successfully",
      200
    );
  } catch (error: any) {
    console.error("Payment order creation error:", error);
    return response.error(
      error.message || "Failed to create payment order",
      500
    );
  }
}
