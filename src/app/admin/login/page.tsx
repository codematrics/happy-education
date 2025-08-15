"use client";

import { FormInput } from "@/components/common/FormInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import useLogin from "@/hooks/useLogin";
import { Toast } from "@/lib/toast";
import { LoginFormData, loginValidations } from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const defaultValues: LoginFormData = {
  userName: "",
  password: "",
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useLogin();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    defaultValues,
    resolver: zodResolver(loginValidations),
    mode: "onSubmit",
  });

  const handleLogin = (data: LoginFormData) => {
    mutate(data, {
      onSuccess: () => {
        Toast.success("You are Logged In Successfully");
        router.replace("/admin");
      },
      onError: (err) => {
        Toast.error(err.message);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            Third Eye Activation Course Administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLogin)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label htmlFor="username">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <FormInput
                    control={form.control}
                    name="userName"
                    placeholder="Enter your username"
                    className="pl-10"
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <FormInput
                    control={form.control}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
