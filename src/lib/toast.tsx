"use client";

import { CircleAlert, CircleCheckBig } from "lucide-react";
import { toast } from "sonner";

export const Toast = {
  success: (message: string) =>
    toast.success(message, {
      duration: 5000,
      icon: <CircleCheckBig className="text-green-500" />,
    }),
  error: (message: string) =>
    toast.success(message, {
      duration: 5000,
      icon: <CircleAlert className="text-red-500" />,
    }),
};
