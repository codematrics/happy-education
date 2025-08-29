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
import useAdminLogin from "@/hooks/useAuth";
import { Toast } from "@/lib/toast";
import { LoginAdminFormData, loginAdminValidations } from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const defaultValues: LoginAdminFormData = {
  userName: "",
  password: "",
};

const Login = () => {
  const { mutate, isPending } = useAdminLogin();
  const router = useRouter();

  const form = useForm<LoginAdminFormData>({
    defaultValues,
    resolver: zodResolver(loginAdminValidations),
    mode: "onSubmit",
  });

  const handleLogin = (data: LoginAdminFormData) => {
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
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted">
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
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                  />
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
