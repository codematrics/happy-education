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
      const hasForgotPassToken = document.cookie.includes(
        "user_forgot_pass_token"
      );

      if (!hasForgotPassToken) {
        // No valid token, redirect to login
        Toast.error(
          "सत्र समाप्त हो गया। कृपया पासवर्ड रीसेट प्रक्रिया फिर से शुरू करें।"
        );
        router.push("/signin");
      }
    };

    checkForgotPasswordToken();
  }, [router]);

  const handleNewPassword = (data: NewPasswordFormData) => {
    mutate(data, {
      onSuccess: () => {
        Toast.success(
          "पासवर्ड सफलतापूर्वक अपडेट हो गया! अब आप नए पासवर्ड से लॉगिन कर सकते हैं।"
        );
        router.push("/signin");
      },
      onError: (err) => {
        Toast.error(err.message || "पासवर्ड अपडेट करने में विफल");
      },
    });
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">अपना पासवर्ड रीसेट करें</h1>
        <p className="text-muted-foreground">
          पासवर्ड रीसेट प्रक्रिया पूरी करने के लिए नया पासवर्ड दर्ज करें
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleNewPassword)}
          className="space-y-6"
        >
          <FormInput
            label="पासवर्ड"
            name="password"
            type="password"
            placeholder="अपना पासवर्ड दर्ज करें"
            control={form.control}
          />
          <FormInput
            label="पासवर्ड की पुष्टि करें"
            name="confirmPassword"
            type="password"
            placeholder="पासवर्ड की पुष्टि दर्ज करें"
            control={form.control}
          />
          <Button
            type="submit"
            disabled={isPending}
            size="lg"
            className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth group"
          >
            {isPending ? "अपडेट हो रहा है..." : "पासवर्ड रीसेट करें"}
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
            href="/signin"
            className="text-primary hover:underline font-medium"
          >
            वापस लॉगिन पर जाएं
          </Link>
        </p>
      </div>
    </>
  );
};

export default NewPassword;
