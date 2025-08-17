"use client";

import { useAuthCheck } from "@/hooks/useAuth";
import { useCreateCheckout } from "@/hooks/usePayment";
import { CourseCurrency } from "@/types/constants";
import { Course } from "@/types/types";
import { Loader2, Play, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { forwardRef, useState } from "react";
import { Button } from "../ui/button";
import CheckoutModal from "./CheckoutModal";
import PaymentForm from "./PaymentForm";

interface BuyButtonProps {
  course: Course;
  className?: string;
  size?: "sm" | "lg" | "default";
  variant?: "default" | "primary" | "gradient";
  showPrice?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  oneClickPayment?: boolean; // Enable one-click payment for logged-in users
}

const BuyButton = forwardRef<HTMLButtonElement, BuyButtonProps>(
  (
    {
      course,
      className = "",
      size = "default",
      variant = "gradient",
      showPrice = true,
      fullWidth = false,
      disabled = false,
      oneClickPayment = true,
    },
    ref
  ) => {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [checkoutData, setCheckoutData] = useState<any>(null);
    const router = useRouter();
    // ✅ Use cached auth data instead of cookie
    const { data: authData, isLoading: authLoading } = useAuthCheck();
    const isLoggedIn = authData?.data?.isLoggedIn ?? false;

    const createCheckout = useCreateCheckout();

    const handleBuyClick = async () => {
      if (course.accessType === "free") {
        // Handle free course enrollment
        return;
      }

      if (course.isPurchased) {
        router.push(`/videos/${course._id}`);
        return;
      }

      // If user is logged in and one-click payment is enabled, go directly to payment
      if (isLoggedIn && oneClickPayment) {
        try {
          const response = await createCheckout.mutateAsync({
            courseId: course._id,
          });

          setCheckoutData(response.data);
          setIsPaymentOpen(true);
        } catch (error) {
          console.error("Checkout failed:", error);
          setIsCheckoutOpen(true); // fallback to modal
        }
      } else {
        // Show checkout modal for guest users or when one-click is disabled
        setIsCheckoutOpen(true);
      }
    };

    const getCurrencySymbol = () => {
      return course.currency === CourseCurrency.dollar ? "$" : "₹";
    };

    const getButtonVariant = () => {
      if (variant === "gradient" || variant === "primary") {
        return "default";
      }
      return variant;
    };

    const getButtonClassName = () => {
      let baseClass = "";

      if (variant === "gradient") {
        baseClass =
          "gradient-primary text-white border-0 shadow-medium hover:shadow-strong";
      }

      if (fullWidth) {
        baseClass += " w-full";
      }

      return `${baseClass} transition-smooth ${className}`;
    };

    if (course.isPurchased) {
      return (
        <Button
          ref={ref}
          size={size}
          variant="default"
          className={`bg-primary hover:bg-primary/90 text-primary-foreground shadow-medium hover:shadow-strong transition-smooth ${
            fullWidth ? "w-full" : ""
          } ${className}`}
          onClick={handleBuyClick}
          disabled={disabled}
        >
          <Play className="w-4 h-4 mr-2" />
          Continue Learning
        </Button>
      );
    }

    if (course.accessType === "free") {
      return (
        <Button
          ref={ref}
          size={size}
          variant="default"
          className={`bg-success hover:bg-success/90 text-white shadow-medium hover:shadow-strong transition-smooth ${
            fullWidth ? "w-full" : ""
          } ${className}`}
          onClick={handleBuyClick}
          disabled={disabled}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Learning - Free
        </Button>
      );
    }

    return (
      <>
        <Button
          ref={ref}
          size={size}
          variant={getButtonVariant()}
          className={getButtonClassName()}
          onClick={handleBuyClick}
          disabled={disabled || createCheckout.isPending || authLoading}
        >
          {createCheckout.isPending || authLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )}
          {showPrice ? (
            <>
              Enroll Now - {getCurrencySymbol()}
              {course.price}
            </>
          ) : (
            "Enroll Now"
          )}
        </Button>

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          course={course}
          isLoggedIn={isLoggedIn}
        />

        {/* One-click payment modal */}
        {isPaymentOpen && checkoutData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Complete Payment</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsPaymentOpen(false);
                    setCheckoutData(null);
                  }}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              <PaymentForm
                checkoutData={checkoutData}
                userEmail="" // you can pass user email if authData has it
                onSuccess={() => {
                  setIsPaymentOpen(false);
                  setCheckoutData(null);
                }}
                onBack={() => {
                  setIsPaymentOpen(false);
                  setCheckoutData(null);
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }
);

BuyButton.displayName = "BuyButton";

export default BuyButton;
