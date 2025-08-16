"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  className?: string;
  placeholder?: string;
  options: { label: string; value: string }[]; // only string values allowed
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  className = "",
  placeholder,
  options,
}: FormSelectProps<T>) {
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
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={className}>
                    <SelectValue
                      placeholder={placeholder || "Select an option"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
