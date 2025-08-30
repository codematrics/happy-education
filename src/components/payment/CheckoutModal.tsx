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
    if (!isLoggedIn && !email?.trim()) return;

    try {
      const response = await createCheckout.mutateAsync({
        courseId: course._id,
        userEmail: !isLoggedIn ? email : undefined,
      });
      setCheckoutData(response.data);
      setStep("payment");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getCurrencySymbol = () =>
    course.currency === CourseCurrency.dollar ? "$" : "₹";
  const getCurrencyIcon = () =>
    course.currency === CourseCurrency.dollar ? (
      <DollarSign className="w-5 h-5" />
    ) : (
      <IndianRupee className="w-5 h-5" />
    );

  const getAccessTypeLabel = () => {
    switch (course.accessType) {
      case "lifetime":
        return "जीवन भर पहुँच";
      case "monthly":
        return "30 दिन पहुँच";
      case "yearly":
        return "365 दिन पहुँच";
      default:
        return "कोर्स पहुँच";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "details" ? "कोर्स चेकआउट" : "भुगतान पूरा करें"}
          </DialogTitle>
          <DialogDescription>
            {step === "details"
              ? "अपने कोर्स की जानकारी देखें और भुगतान की ओर बढ़ें"
              : "कोर्स तक पहुँचने के लिए अपना भुगतान पूरा करें"}
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
              {/* Email Input */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">ईमेल पता</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={
                      isLoggedIn ? "लोड हो रहा है..." : "अपना ईमेल दर्ज करें"
                    }
                    value={email}
                    onChange={(e) => setUserEmail(e.target.value)}
                    disabled={isLoggedIn}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoggedIn
                      ? "आप इस ईमेल पते से लॉग इन हैं"
                      : "हम आपके लिए खाता बनाएंगे और लॉगिन विवरण इस ईमेल पर भेजेंगे"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>कोर्स मूल्य</span>
                  <span>
                    {getCurrencySymbol()}
                    {course.price}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>कुल</span>
                  <span className="flex items-center space-x-1">
                    {getCurrencyIcon()}
                    <span>{course.price}</span>
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  🔒 सुरक्षित भुगतान Razorpay द्वारा संचालित
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  30 दिन की मनी-बैक गारंटी
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
                {createCheckout.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                भुगतान की ओर बढ़ें
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
