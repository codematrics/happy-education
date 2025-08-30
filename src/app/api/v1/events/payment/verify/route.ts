import connect from "@/lib/db";
import { Event } from "@/models/Events";
import { sendMail } from "@/services/email";
import { eventRegistrationEmailTemplate } from "@/utils/eventEmail";
import { response } from "@/utils/response";
import crypto from "crypto";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      userDetails,
    } = body;

    // Validate required fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !eventId ||
      !userDetails
    ) {
      return response.error("Missing required payment details", 400);
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return response.error("Invalid payment signature", 400);
    }

    await connect();

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return response.error("Event not found", 404);
    }

    // Prepare email data
    const { firstName, lastName, email } = userDetails;
    const userName = `${firstName} ${lastName}`;

    // Send event registration email with join link
    try {
      await sendMail(
        eventRegistrationEmailTemplate({
          userName,
          eventName: event.name,
          eventDate: event.day.toISOString().split('T')[0],
          joinLink: event.joinLink,
          eventDescription: event.description || "",
          benefits: event.benefits || [],
        }),
        `Registration Confirmed: ${event.name}`,
        "Event Registration Confirmation",
        email
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the payment verification if email fails
      // but log the error for manual follow-up
    }

    // You can also store the registration in a database if needed
    // For now, we'll just log the successful registration
    console.log("Event registration successful:", {
      eventId: event._id,
      eventName: event.name,
      userEmail: email,
      userName,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      timestamp: new Date().toISOString(),
    });

    return response.success(
      {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        eventName: event.name,
      },
      "Payment verified successfully. Join link sent to email.",
      200
    );
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return response.error(
      error.message || "Payment verification failed",
      500
    );
  }
}