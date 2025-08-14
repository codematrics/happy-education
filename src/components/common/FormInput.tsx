"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  helperText?: string;
  variant?: "default" | "outline";
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  className = "",
  placeholder,
  helperText,
  variant = "default",
}: FormInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <div className="relative mb-5">
            <FormItem className="gap-1.5">
              {label && (
                <FormLabel className="text-lg text-white font-normal">
                  {label}
                </FormLabel>
              )}
              <FormControl>
                <Input
                  type={inputType}
                  className={` ${className}`}
                  placeholder={placeholder}
                  {...field}
                />
              </FormControl>
            </FormItem>
            <div className="absolute bottom-0 leading-4 translate-y-5 left-0">
              <FormMessage className="text-red-500 ms-1" />
            </div>
          </div>
        )}
      />
    </>
  );
}
