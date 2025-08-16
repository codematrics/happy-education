"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useResendOtp, useVerifyOtp } from "@/hooks/useAuth";
import { Toast } from "@/lib/toast";
import { OtpFormData, otpValidations } from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, RefreshCw, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const defaultValues: OtpFormData = {
  otp: "",
};

const OTPVerification = () => {
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();
  const router = useRouter();
  const [otpType, setOtpType] = useState<"signup" | "forgot-password" | null>(
    null
  );

  const form = useForm<OtpFormData>({
    defaultValues,
    resolver: zodResolver(otpValidations),
    mode: "onSubmit",
  });

  const otpValue = form.watch("otp"); // ✅ reactive value

  // Determine OTP type from cookies on client side
  useEffect(() => {
    const checkOtpType = () => {
      const hasSignupToken = document.cookie.includes("user_otp_token");
      const hasForgotPassToken = document.cookie.includes(
        "user_forgot_pass_token"
      );

      if (hasSignupToken) {
        setOtpType("signup");
      } else if (hasForgotPassToken) {
        setOtpType("forgot-password");
      } else {
        router.push("/signin");
      }
    };

    checkOtpType();
  }, [router]);

  const handleVerify = (data: OtpFormData) => {
    verifyOtp(data, {
      onSuccess: () => {
        if (otpType === "signup") {
          Toast.success(
            "Account verified successfully! You are now logged in."
          );
          router.push("/");
        } else if (otpType === "forgot-password") {
          Toast.success("OTP verified! You can now reset your password.");
          router.push("/new-password");
        }
      },
      onError: (err) => {
        Toast.error(err.message || "OTP verification failed");
      },
    });
  };

  const handleResend = () => {
    resendOtp(null, {
      onSuccess: () => {
        Toast.success("OTP has been resent to your email");
      },
      onError: (err) => {
        Toast.error(err.message || "Failed to resend OTP");
      },
    });
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {otpType === "signup"
            ? "Verify Your Account"
            : "Verify Your Identity"}
        </h1>
        <p className="text-muted-foreground">
          {otpType === "signup"
            ? "We've sent a verification code to your email"
            : "We've sent a password reset code to your email"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-4 block text-center">
              Enter 4-digit verification code
            </label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={otpValue}
                onChange={(value) =>
                  form.setValue("otp", value, { shouldValidate: true })
                }
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {form.formState.errors.otp && (
              <p className="text-sm text-red-500 text-center mt-2">
                {form.formState.errors.otp.message}
              </p>
            )}
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            disabled={isVerifying}
            size="lg"
            className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : otpType === "signup" ? (
              "Verify Account"
            ) : (
              "Verify & Continue"
            )}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            <Button
              type="button"
              disabled={isResending}
              variant="ghost"
              onClick={handleResend}
              className="text-primary hover:text-primary/80"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 transition-transform ${
                  isResending ? "animate-spin" : ""
                }`}
              />
              Resend Code
            </Button>
          </div>

          {/* Back navigation */}
          <div className="text-center">
            <Link
              href={otpType === "signup" ? "/signup" : "/forgot-password"}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-smooth"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {otpType === "signup"
                ? "Back to Sign Up"
                : "Back to Forgot Password"}
            </Link>
          </div>
        </form>
      </Form>
    </>
  );
};

export default OTPVerification;
