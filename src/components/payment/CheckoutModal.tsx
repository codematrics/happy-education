"use client";

import { useCreateCheckout } from "@/hooks/usePayment";
import { CourseCurrency } from "@/types/constants";
import { Course } from "@/types/types";
import { DollarSign, IndianRupee, Loader2 } from "lucide-react";
import { useState } from "react";
import CustomImage from "../common/CustomImage";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import PaymentForm from "./PaymentForm";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  isLoggedIn: boolean;
  onComplete: () => void;
  onStart: () => void;
  userEmail: string;
}

const CheckoutModal = ({
  isOpen,
  onClose,
  course,
  isLoggedIn,
  onComplete,
  onStart,
  userEmail,
}: CheckoutModalProps) => {
  const [email, setUserEmail] = useState("");
  const [step, setStep] = useState<"details" | "payment">("details");
  const [checkoutData, setCheckoutData] = useState<any>(null);

  const createCheckout = useCreateCheckout();

  const handleContinueToPayment = async () => {
    if (!isLoggedIn && !email?.trim()) {
      return;
    }

    try {
      const response = await createCheckout.mutateAsync({
        courseId: course._id,
        userEmail: !isLoggedIn ? email : undefined,
      });

      setCheckoutData(response.data);
      setStep("payment");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const getCurrencySymbol = () => {
    return course.currency === CourseCurrency.dollar ? "$" : "₹";
  };

  const getCurrencyIcon = () => {
    return course.currency === CourseCurrency.dollar ? (
      <DollarSign className="w-5 h-5" />
    ) : (
      <IndianRupee className="w-5 h-5" />
    );
  };

  const getAccessTypeLabel = () => {
    switch (course.accessType) {
      case "lifetime":
        return "Lifetime Access";
      case "monthly":
        return "30 Days Access";
      case "yearly":
        return "365 Days Access";
      default:
        return "Access";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "details" ? "Course Checkout" : "Complete Payment"}
          </DialogTitle>
          <DialogDescription>
            {step === "details"
              ? "Review your course and continue to payment"
              : "Complete your payment to access the course"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex space-x-3">
              <CustomImage
                src={course.thumbnail?.url}
                alt={course.name}
                className="w-16 h-12 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-sm line-clamp-2">
                  {course.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {getAccessTypeLabel()}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 font-bold text-lg">
                  {getCurrencyIcon()}
                  <span>{course.price}</span>
                </div>
              </div>
            </div>
          </div>

          {step === "details" && (
            <>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={isLoggedIn ? "Loading..." : "Enter your email"}
                    value={email}
                    onChange={(e) => setUserEmail(e.target.value)}
                    disabled={isLoggedIn}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoggedIn
                      ? "You're logged in with this email address"
                      : "We'll create an account for you and send login details to this email"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Course Price</span>
                  <span>
                    {getCurrencySymbol()}
                    {course.price}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="flex items-center space-x-1">
                    {getCurrencyIcon()}
                    <span>{course.price}</span>
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  🔒 Secure payment powered by Razorpay
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  30-day money-back guarantee
                </p>
              </div>

              <Button
                onClick={handleContinueToPayment}
                disabled={
                  createCheckout.isPending || (!isLoggedIn && !email.trim())
                }
                className="w-full gradient-primary text-white"
                size="lg"
              >
                {createCheckout.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Continue to Payment
              </Button>
            </>
          )}

          {step === "payment" && checkoutData && (
            <PaymentForm
              checkoutData={checkoutData}
              userEmail={email || userEmail}
              onSuccess={() => {
                onClose();
                setStep("details");
              }}
              onBack={() => setStep("details")}
              onClose={onClose}
              onComplete={onComplete}
              onStart={onStart}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
