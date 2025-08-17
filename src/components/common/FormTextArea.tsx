"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormTextareaProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  className?: string;
  placeholder?: string;
  rows?: number;
}

export function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  className = "",
  placeholder,
  rows = 4,
}: FormTextareaProps<T>) {
  return (
    <div className="relative">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <div className="relative mb-5">
            <FormItem className="gap-1.5">
              {label && <FormLabel className="font-normal">{label}</FormLabel>}
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={placeholder}
                  className={`${className}`}
                  rows={rows}
                />
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
