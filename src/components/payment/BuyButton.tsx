"use client";

import { useModal } from "@/context/CheckOutContext";
import { useCreateCheckout } from "@/hooks/usePayment";
import { getCookie } from "@/lib/cookie";
import { CourseAccessType, CourseCurrency } from "@/types/constants";
import { Course } from "@/types/types";
import { Play, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { forwardRef } from "react";
import { Button } from "../ui/button";

interface BuyButtonProps {
  course: Course;
  className?: string;
  size?: "sm" | "lg" | "default";
  variant?: "default" | "primary" | "gradient";
  showPrice?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  oneClickPayment?: boolean;
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
    const createCheckout = useCreateCheckout();
    const { openModal, setShowPaymentLoading, closeModal } = useModal();
    const router = useRouter();

    const handleBuyClick = async () => {
      if (course.accessType === CourseAccessType.free || course.isPurchased) {
        router.push(`/videos/${course._id}`);
        return;
      }

      setShowPaymentLoading(true);
      const isLoggedIn = (await getCookie("user_token"))?.value;
      const userData = JSON.parse(
        (await getCookie("user_data"))?.value || "{}"
      );

      if (isLoggedIn && oneClickPayment) {
        try {
          const response = await createCheckout.mutateAsync({
            courseId: course._id,
          });
          openModal("payment", {
            checkoutData: response.data,
            userEmail: userData?.email ?? null,
            onClose: () => {
              setShowPaymentLoading(false);
              closeModal();
            },
            onSuccess: () => router.push(`/videos/${course._id}`),
            onStart: () => setShowPaymentLoading(true),
            onComplete: () => setShowPaymentLoading(false),
          });
        } catch (error) {
          console.error("Checkout failed:", error);
          openModal("checkout", {
            course,
            isLoggedIn,
            userEmail: userData?.email ?? null,
            onClose: () => {
              setShowPaymentLoading(false);
              closeModal();
            },
            onStart: () => setShowPaymentLoading(true),
            onComplete: () => setShowPaymentLoading(false),
          });
        }
      } else {
        openModal("checkout", {
          course,
          isLoggedIn,
          userEmail: userData?.email ?? null,
          onClose: () => {
            setShowPaymentLoading(false);
            closeModal();
          },
          onStart: () => setShowPaymentLoading(true),
          onComplete: () => setShowPaymentLoading(false),
        });
      }
    };

    const getCurrencySymbol = () =>
      course.currency === CourseCurrency.dollar ? "$" : "₹";

    const getButtonVariant = () =>
      variant === "gradient" || variant === "primary" ? "default" : variant;

    const getButtonClassName = () => {
      let baseClass =
        variant === "gradient"
          ? "gradient-primary text-white border-0 shadow-medium hover:shadow-strong"
          : "";
      if (fullWidth) baseClass += " w-full";
      return `${baseClass} transition-smooth ${className}`;
    };

    if (course.isPurchased) {
      return (
        <Button
          ref={ref}
          size={size}
          variant="default"
          className={getButtonClassName()}
          onClick={handleBuyClick}
          disabled={disabled}
        >
          <Play className="w-4 h-4 mr-2" />
          सीखना जारी रखें
        </Button>
      );
    }

    if (course.accessType === CourseAccessType.free) {
      return (
        <Button
          ref={ref}
          size={size}
          variant="default"
          className={getButtonClassName()}
          onClick={handleBuyClick}
          disabled={disabled}
        >
          <Play className="w-4 h-4 mr-2" />
          शुरू करें - मुफ्त
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        size={size}
        variant={getButtonVariant()}
        className={getButtonClassName()}
        onClick={handleBuyClick}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {showPrice
          ? `नामांकित करें - ${getCurrencySymbol()}${course.price}`
          : "नामांकित करें"}
      </Button>
    );
  }
);

BuyButton.displayName = "BuyButton";

export default BuyButton;
