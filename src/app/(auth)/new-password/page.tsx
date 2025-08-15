"use client";

import { FormInput } from "@/components/common/FormInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useNewPassword } from "@/hooks/useAuth";
import { Toast } from "@/lib/toast";
import { NewPasswordFormData, newPasswordValidations } from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const defaultValues: NewPasswordFormData = {
  password: "",
  confirmPassword: "",
};

const NewPassword = () => {
  const router = useRouter();
  const { mutate, isPending } = useNewPassword();

  const form = useForm({
    resolver: zodResolver(newPasswordValidations),
    defaultValues,
    mode: "onSubmit",
  });

  // Check if user has valid forgot password token
  useEffect(() => {
    const checkForgotPasswordToken = () => {
      const hasForgotPassToken = document.cookie.includes("user_forgot_pass_token");
      
      if (!hasForgotPassToken) {
        // No valid token, redirect to login
        Toast.error("Session expired. Please restart the password reset process.");
        router.push("/login");
      }
    };

    checkForgotPasswordToken();
  }, [router]);

  const handleNewPassword = (data: NewPasswordFormData) => {
    mutate(data, {
      onSuccess: () => {
        Toast.success("Password updated successfully! You can now login with your new password.");
        router.push("/login");
      },
      onError: (err) => {
        Toast.error(err.message || "Failed to update password");
      },
    });
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
        <p className="text-muted-foreground">
          Enter your new password to complete the reset process
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleNewPassword)}
          className="space-y-6"
        >
          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            control={form.control}
          />
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Enter confirm password"
            control={form.control}
          />
          <Button
            type="submit"
            disabled={isPending}
            size="lg"
            className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth group"
          >
            {isPending ? "Updating..." : "Reset Password"}
            {!isPending && (
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
            )}
          </Button>
        </form>
      </Form>
      <div className="mt-6">
        <Separator className="my-4" />
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </>
  );
};

export default NewPassword;
