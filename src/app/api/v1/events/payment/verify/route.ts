import connect from "@/lib/db";
import { EventRegistration } from "@/models/EventRegistrations";
import { Event } from "@/models/Events";
import { sendMail } from "@/services/email";
import { EventRegistrationStatus } from "@/types/constants";
import { emailTemplate } from "@/utils/email";
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

    // Prepare user data
    const { firstName, lastName, email, phone } = userDetails;
    const userName = `${firstName} ${lastName}`;

    // Create/Update event registration
    const registration = await EventRegistration.findOneAndUpdate(
      {
        eventId: event._id,
        email: email,
        orderId: razorpay_order_id,
      },
      {
        eventId: event._id,
        eventName: event.name,
        firstName,
        lastName,
        phoneNumber: phone,
        email,
        paymentStatus: EventRegistrationStatus.paid,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: event.amount,
        currency: event.currency || "rupee",
        registrationDate: new Date(),
        joinLinkSent: true,
      },
      {
        upsert: true,
        new: true,
      }
    );

    // Send event registration email with join link
    try {
      await sendMail(
        emailTemplate.otp(`Your join link: ${event.joinLink}`),
        `Registration Confirmed: ${event.name}`,
        "Event Registration Confirmation",
        email
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Mark join link as not sent if email fails
      await EventRegistration.findByIdAndUpdate(registration._id, {
        joinLinkSent: false,
      });
    }

    console.log("Event registration successful:", {
      registrationId: registration._id,
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
    return response.error(error.message || "Payment verification failed", 500);
  }
}
