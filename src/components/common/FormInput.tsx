"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  [key: string]: any;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  className = "",
  placeholder,
  ...props
}: FormInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative">
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <div className="relative mb-5">
            <FormItem className="gap-1.5">
              {label && <FormLabel className="font-normal">{label}</FormLabel>}
              <FormControl>
                <div className="relative">
                  <Input
                    type={inputType}
                    placeholder={placeholder}
                    className={`${className} ${
                      fieldState.error
                        ? "border-destructive focus:border-destructive focus:ring-destructive"
                        : ""
                    }`}
                    {...field}
                    onChange={(e) =>
                      type === "number"
                        ? field.onChange({
                            ...e,
                            target: {
                              ...e.target,
                              value: Number(e.target.value || 0),
                            },
                          })
                        : field.onChange(e)
                    }
                    {...props}
                  />
                  {type === "password" && (
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
                  )}
                </div>
              </FormControl>
            </FormItem>
            <div className="absolute bottom-0 leading-4 translate-y-5 left-0">
              <FormMessage className="text-red-500 ms-1" />
            </div>
          </div>
        )}
      />
    </div>
  );
}
