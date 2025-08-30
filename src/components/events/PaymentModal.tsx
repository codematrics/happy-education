"use client";

import { FormInput } from "@/components/common/FormInput";
import { Form } from "@/components/ui/form";
import { Event } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Modal from "../common/CustomDialog";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const paymentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Valid 10-digit phone number is required"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingMessage, setProcessingMessage] = React.useState("");
  const [showResult, setShowResult] = React.useState(false);
  const [resultData, setResultData] = React.useState<{
    success: boolean;
    title: string;
    message: string;
  } | null>(null);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const formatPrice = (price: number, currency: "dollar" | "rupee") => {
    const symbol = currency === "dollar" ? "$" : "₹";
    return `${symbol}${price.toFixed(2)}`;
  };

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        // Check if script already exists
        const existingScript = document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );
        if (existingScript) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          console.log("Razorpay script loaded successfully");
          resolve(true);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay script");
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    if (isOpen && !window.Razorpay) {
      loadRazorpayScript().then((loaded) => {
        if (!loaded) {
          toast.error(
            "Failed to load payment gateway. Please refresh and try again."
          );
        }
      });
    }
  }, [isOpen]);

  const handlePayment = async (formData: PaymentFormData) => {
    try {
      // Check if Razorpay key is available
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error("Payment configuration error. Please contact support.");
        console.error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not defined");
        return;
      }

      // Check if Razorpay script is loaded
      if (!window.Razorpay) {
        toast.error("Payment gateway not loaded. Please try again.");
        return;
      }

      // Create payment order
      const orderResponse = await fetch("/api/v1/events/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event._id,
          amount: event.amount,
          currency: event.currency,
          userDetails: formData,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "Failed to create payment order");
      }

      const orderData = await orderResponse.json();
      console.log("Order created:", orderData);

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Event Registration",
        description: `Registration for ${event.name}`,
        order_id: orderData.data.id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async (response: any) => {
          // Close the payment form and show processing
          setIsProcessing(true);
          setProcessingMessage("Verifying your payment...");

          try {
            // Verify payment
            const verifyResponse = await fetch(
              "/api/v1/events/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  eventId: event._id,
                  userDetails: formData,
                }),
              }
            );

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const result = await verifyResponse.json();

            setIsProcessing(false);

            if (result.status) {
              setResultData({
                success: true,
                title: "Payment Successful! 🎉",
                message:
                  "Your registration is confirmed! The join link has been sent to your email address. Please check your inbox (and spam folder) for the event details.",
              });
              setShowResult(true);
            } else {
              throw new Error(result.message || "Payment verification failed");
            }
          } catch (error: any) {
            setIsProcessing(false);
            setResultData({
              success: false,
              title: "Payment Failed ❌",
              message:
                error.message ||
                "Payment verification failed. Please try again or contact support if the issue persists.",
            });
            setShowResult(true);
          }
        },
        modal: {
          ondismiss: () => {
            if (!isProcessing) {
              setResultData({
                success: false,
                title: "Payment Cancelled",
                message:
                  "You cancelled the payment process. You can try again anytime.",
              });
              setShowResult(true);
            }
          },
        },
      };

      try {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (razorpayError: any) {
        console.error("Razorpay initialization error:", razorpayError);
        toast.error("Failed to initialize payment gateway. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
    }
  };

  const handleClose = () => {
    // Reset all states
    setIsProcessing(false);
    setProcessingMessage("");
    setShowResult(false);
    setResultData(null);
    form.reset();
    onClose();
  };

  const handleResultClose = () => {
    setShowResult(false);
    setResultData(null);
    if (resultData?.success) {
      // If payment was successful, close the entire modal
      handleClose();
    }
    // If payment failed, keep the form open for retry
  };

  // Processing Modal
  if (isProcessing) {
    return (
      <Modal isOpen={true} onClose={() => {}}>
        <div className="p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
          <p className="text-muted-foreground">{processingMessage}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we verify your payment...
          </p>
        </div>
      </Modal>
    );
  }

  // Result Modal
  if (showResult && resultData) {
    return (
      <Modal isOpen={true} onClose={handleResultClose}>
        <div className="p-6 text-center">
          <div
            className={`text-6xl mb-4 ${
              resultData.success ? "text-green-500" : "text-red-500"
            }`}
          >
            {resultData.success ? "🎉" : "❌"}
          </div>
          <h3 className="text-xl font-semibold mb-3">{resultData.title}</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {resultData.message}
          </p>

          <div className="space-y-2">
            <button
              onClick={handleResultClose}
              className={`w-full px-4 py-2 rounded-lg font-medium ${
                resultData.success
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {resultData.success ? "Great!" : "Try Again"}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // Payment Form Modal
  return (
    <Modal
      isOpen={isOpen && !isProcessing && !showResult}
      onClose={handleClose}
      title="Event Registration"
      confirmText={`Pay ${formatPrice(event.amount, event.currency)}`}
      onConfirm={form.handleSubmit(handlePayment)}
    >
      <div className="p-6">
        {/* Event Summary */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-lg mb-2">{event.name}</h3>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Registration Fee:</span>
            <span className="font-medium text-foreground text-lg">
              {formatPrice(event.amount, event.currency)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handlePayment)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                name="firstName"
                control={form.control}
                label="First Name *"
                placeholder="Enter first name"
              />
              <FormInput
                name="lastName"
                control={form.control}
                label="Last Name *"
                placeholder="Enter last name"
              />
            </div>

            <FormInput
              name="email"
              control={form.control}
              label="Email *"
              type="email"
              placeholder="Enter email address"
            />

            <FormInput
              name="phone"
              control={form.control}
              label="Phone Number *"
              type="tel"
              placeholder="Enter 10-digit phone number"
            />
          </form>
        </Form>
      </div>
    </Modal>
  );
};

export default PaymentModal;
