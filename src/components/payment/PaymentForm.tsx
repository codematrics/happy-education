"use client";

import { useVerifyPayment } from "@/hooks/usePayment";
import { CourseCurrency } from "@/types/constants";
import { ArrowLeft, CreditCard, Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface PaymentFormProps {
  checkoutData: {
    orderId: string;
    amount: number;
    currency: string;
    course: {
      id: string;
      name: string;
      price: number;
      currency: string;
      accessType: string;
    };
    razorpayKeyId: string;
    transactionId: string;
    userEmail: string;
    isLoggedIn: boolean;
  };
  userEmail?: string;
  onSuccess: () => void;
  onBack: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentForm = ({
  checkoutData,
  userEmail,
  onSuccess,
  onBack,
}: PaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const verifyPayment = useVerifyPayment();
  const router = useRouter();

  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay");
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  const getCurrencySymbol = () => {
    return checkoutData.course.currency === CourseCurrency.dollar ? "$" : "₹";
  };

  const getRazorpayCurrency = () => {
    return checkoutData.course.currency === CourseCurrency.dollar
      ? "USD"
      : "INR";
  };

  const handlePayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      console.error("Razorpay not loaded");
      return;
    }

    setIsProcessing(true);

    const options = {
      key: checkoutData.razorpayKeyId,
      amount: checkoutData.amount,
      currency: getRazorpayCurrency(),
      order_id: checkoutData.orderId,
      name: "Happy Education",
      description: checkoutData.course.name,
      image: "/logo/logo.png",
      prefill: {
        email: checkoutData.userEmail || userEmail,
      },
      theme: {
        color: "#3B82F6",
      },
      handler: async (response: any) => {
        try {
          await verifyPayment.mutateAsync({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            userEmail: !checkoutData.isLoggedIn
              ? userEmail || checkoutData.userEmail
              : undefined,
          });
          onSuccess();
        } catch (error) {
          console.error("Payment verification failed:", error);
        } finally {
          setIsProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      console.error("Payment failed:", response.error);
      setIsProcessing(false);

      // Redirect to failure page
      const params = new URLSearchParams({
        courseId: checkoutData.course.id,
        courseName: checkoutData.course.name,
        error: response.error.description || "Payment failed",
        orderId: checkoutData.orderId,
      });

      router.replace(`/payment/failed?${params.toString()}`);
    });

    rzp.open();
  };

  return (
    <div className="space-y-4">
      {/* Payment Summary */}
      <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg p-4 border">
        <div className="flex items-center space-x-2 mb-3">
          <CreditCard className="w-5 h-5 text-primary" />
          <span className="font-semibold">Payment Summary</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Course</span>
            <span className="font-medium">{checkoutData.course.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Access Type</span>
            <span className="font-medium capitalize">
              {checkoutData.course.accessType}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Amount</span>
            <span className="font-bold text-lg">
              {getCurrencySymbol()}
              {checkoutData.course.price}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Security Features */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Secure payment powered by Razorpay</span>
      </div>

      {/* Payment Method Info */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">Accepted Payment Methods:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>• Credit/Debit Cards</div>
          <div>• Net Banking</div>
          <div>• UPI</div>
          <div>• Digital Wallets</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing || verifyPayment.isPending}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handlePayment}
          disabled={!razorpayLoaded || isProcessing || verifyPayment.isPending}
          className="flex-1 gradient-primary text-white"
          size="lg"
        >
          {isProcessing || verifyPayment.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4 mr-2" />
          )}
          {isProcessing || verifyPayment.isPending
            ? "Processing..."
            : "Pay Now"}
        </Button>
      </div>

      {!checkoutData.isLoggedIn && (
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            📧 After payment, we'll create your account and email login details
            to:{" "}
            <span className="font-semibold">
              {userEmail || checkoutData.userEmail}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
