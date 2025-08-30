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
        Toast.success("ओटीपी आपके ईमेल पर भेज दिया गया है");
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
        <div className="w-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-2">
          <Mail className="w-full" />
        </div>
        <h1 className="text-3xl font-bold mb-2">फिर से स्वागत है</h1>
        <p className="text-muted-foreground">
          सीखना जारी रखने के लिए अपने खाते में लॉगिन करें
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleForgotPassword)}
          className="space-y-6"
        >
          <FormInput
            label="ईमेल"
            name="identifier"
            type="email"
            placeholder="अपना ईमेल दर्ज करें"
            control={form.control}
          />

          <Button
            disabled={isPending}
            type="submit"
            size="lg"
            className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth group"
          >
            ओटीपी भेजें
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
          </Button>
        </form>
      </Form>
      <div className="mt-6">
        <Separator className="my-4" />
        <p className="text-center text-sm text-muted-foreground">
          क्या आपका खाता नहीं है?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            मुफ्त में साइन अप करें
          </Link>
        </p>
      </div>
    </>
  );
};

export default ForgotPassword;
