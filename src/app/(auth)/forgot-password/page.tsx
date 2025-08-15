"use client";

import { FormInput } from "@/components/common/FormInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useForgotPassword } from "@/hooks/useAuth";
import { Toast } from "@/lib/toast";
import {
  ForgotPasswordFormData,
  forgotPasswordValidations,
} from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const defaultValues: ForgotPasswordFormData = {
  identifier: "",
};

const ForgotPassword = () => {
  const router = useRouter();
  const { mutate, isPending } = useForgotPassword();

  const form = useForm({
    resolver: zodResolver(forgotPasswordValidations),
    defaultValues,
    mode: "onSubmit",
  });

  const handleForgotPassword = (data: ForgotPasswordFormData) => {
    mutate(data, {
      onSuccess: () => {
        Toast.success("Otp sent to your mail");
        router.replace("/otp");
      },
      onError: (err) => {
        Toast.error(err.message);
      },
    });
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue learning
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleForgotPassword)}
          className="space-y-6"
        >
          <FormInput
            label="Email or Mobile"
            name="identifier"
            type="email"
            placeholder="Enter your email"
            control={form.control}
          />

          <Button
            disabled={isPending}
            type="submit"
            size="lg"
            className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth group"
          >
            Send OTP
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
          </Button>
        </form>
      </Form>
      <div className="mt-6">
        <Separator className="my-4" />
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </>
  );
};

export default ForgotPassword;
