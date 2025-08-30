"use client";

import Logo from "@/../public/logo/logo.png";
import { FormInput } from "@/components/common/FormInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useLogin } from "@/hooks/useAuth";
import { Toast } from "@/lib/toast";
import { LoginUserFormData, loginUserValidations } from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const defaultValues = {
  identifier: "",
  password: "",
};

const SignIn = () => {
  const router = useRouter();
  const { mutate, isPending } = useLogin();

  const form = useForm({
    resolver: zodResolver(loginUserValidations),
    defaultValues,
    mode: "onSubmit",
  });

  const handleLogin = (data: LoginUserFormData) => {
    mutate(data, {
      onSuccess: () => {
        Toast.success("आप सफलतापूर्वक लॉगिन हो गए हैं");
        router.replace("/");
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
          <Image src={Logo} alt="logo" className="w-full" />
        </div>
        <h1 className="text-3xl font-bold mb-2">फिर से स्वागत है</h1>
        <p className="text-muted-foreground">
          सीखना जारी रखने के लिए अपने खाते में लॉगिन करें
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
          <FormInput
            label="ईमेल"
            name="identifier"
            type="email"
            placeholder="अपना ईमेल दर्ज करें"
            control={form.control}
          />

          <FormInput
            label="पासवर्ड"
            name="password"
            type="password"
            placeholder="अपना पासवर्ड दर्ज करें"
            control={form.control}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="rounded border-border" />
              <span className="text-sm text-muted-foreground">
                मुझे याद रखें
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              पासवर्ड भूल गए?
            </Link>
          </div>

          <Button
            disabled={isPending}
            type="submit"
            size="lg"
            className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth group"
          >
            {isPending ? (
              "लॉगिन हो रहा है..."
            ) : (
              <>
                लॉगिन करें
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
              </>
            )}
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

export default SignIn;
