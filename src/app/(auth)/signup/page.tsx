"use client";
import Logo from "@/../public/logo/logo.png";
import { FormInput } from "@/components/common/FormInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useSignup } from "@/hooks/useAuth";
import { Toast } from "@/lib/toast";
import { AuthIdentifiers } from "@/types/constants";
import { SignUpUserFormData, signupUserValidations } from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const defaultValues: SignUpUserFormData = {
  identifier: AuthIdentifiers.email,
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const SignUp = () => {
  const { mutate, isPending } = useSignup();
  const router = useRouter();

  const form = useForm<SignUpUserFormData>({
    defaultValues,
    resolver: zodResolver(signupUserValidations),
    mode: "onSubmit",
  });

  const handleLogin = (data: SignUpUserFormData) => {
    mutate(data, {
      onSuccess: () => {
        Toast.success("आपका खाता सफलतापूर्वक बनाया गया");
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
          <Image src={Logo} alt="logo" className="w-full text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">सीखना शुरू करें</h1>
        <p className="text-muted-foreground">
          अपना खाता बनाएं और आज से सीखना शुरू करें
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
          <div className="grid md:grid-cols-2 md:gap-4 mb-0">
            <FormInput
              label="पहला नाम"
              name="firstName"
              type="text"
              placeholder="पहला नाम"
              control={form.control}
            />
            <FormInput
              label="अंतिम नाम"
              name="lastName"
              type="text"
              placeholder="अंतिम नाम"
              control={form.control}
            />
          </div>

          <FormInput
            label="ईमेल"
            name="email"
            type="email"
            placeholder="john.doe@example.com"
            control={form.control}
          />

          <FormInput
            label="पासवर्ड"
            name="password"
            type="password"
            placeholder="मजबूत पासवर्ड बनाएं"
            control={form.control}
          />

          <FormInput
            label="पासवर्ड की पुष्टि करें"
            name="confirmPassword"
            type="password"
            placeholder="पासवर्ड की पुष्टि करें"
            control={form.control}
          />

          <Button
            disabled={isPending}
            type="submit"
            size="lg"
            className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth group"
          >
            {isPending ? (
              "खाता बनाया जा रहा है..."
            ) : (
              <>
                ईमेल के साथ जारी रखें
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6">
        <div className="text-center text-xs text-muted-foreground mb-4">
          खाता बनाकर, आप हमारी{" "}
          <Link href="/terms" className="text-primary hover:underline">
            सेवा की शर्तें
          </Link>{" "}
          और{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            गोपनीयता नीति
          </Link>{" "}
          से सहमत होते हैं
        </div>

        <Separator className="my-4" />
        <p className="text-center text-sm text-muted-foreground">
          पहले से खाता है?{" "}
          <Link
            href="/signin"
            className="text-primary hover:underline font-medium"
          >
            यहाँ लॉगिन करें
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignUp;
