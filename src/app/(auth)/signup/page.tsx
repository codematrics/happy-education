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
        Toast.success("You are Signed Up Successfully");
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
        <h1 className="text-3xl font-bold mb-2">Start Learning</h1>
        <p className="text-muted-foreground">
          Create your account and start learning today
        </p>
      </div>

      {/* <Tabs
        onValueChange={(value) =>
          form.setValue("identifier", value as AuthIdentifiers)
        }
        defaultValue={form.getValues("identifier")}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value={AuthIdentifiers.email}
            className="flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger
            value={AuthIdentifiers.phone}
            className="flex items-center space-x-2"
          >
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </TabsTrigger>
        </TabsList> */}

      {/* <TabsContent className="mb-0" value={AuthIdentifiers.email}> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
          <div className="grid md:grid-cols-2 md:gap-4 mb-0">
            <FormInput
              label="First Name"
              name="firstName"
              type="text"
              placeholder="first name"
              control={form.control}
            />
            <FormInput
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="last name"
              control={form.control}
            />
          </div>

          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="john.doe@example.com"
            control={form.control}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            control={form.control}
          />

          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            control={form.control}
          />

          <Button
            disabled={isPending}
            type="submit"
            size="lg"
            className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth group"
          >
            {isPending ? (
              "Creating Account..."
            ) : (
              <>
                Continue with Email
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
              </>
            )}
          </Button>
        </form>
      </Form>
      {/* </TabsContent>

        <TabsContent className="mb-0" value={AuthIdentifiers.phone}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLogin)}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4 mb-0">
                <FormInput
                  label="First Name"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  control={form.control}
                />
                <FormInput
                  label="Last Name"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  control={form.control}
                />
              </div>

              <FormInput
                label="Phone Number"
                name="mobile"
                type="tel"
                placeholder="+1 (555) 123-4567"
                control={form.control}
              />

              <FormInput
                label="Password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                control={form.control}
              />

              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                control={form.control}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth group"
              >
                Continue with Email
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs> */}

      <div className="mt-6">
        <div className="text-center text-xs text-muted-foreground mb-4">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </div>

        <Separator className="my-4" />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-primary hover:underline font-medium"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignUp;
