"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Checkbox } from "../ui/checkbox";

interface FormCheckboxProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  helperText?: string;
  className?: string;
}

export function FormCheckbox<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  className = "",
}: FormCheckboxProps<T>) {
  return (
    <div className="relative mb-5">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={`flex items-start gap-2 ${className}`}>
            <FormControl>
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(checked: boolean) => field.onChange(checked)}
              />
            </FormControl>
            {label && (
              <div className="flex flex-col">
                <FormLabel className="font-normal">{label}</FormLabel>
                {helperText && (
                  <span className="text-sm text-muted-foreground">
                    {helperText}
                  </span>
                )}
              </div>
            )}
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />
    </div>
  );
}
