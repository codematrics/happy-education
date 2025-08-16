"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { File, Image, Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import CustomImage from "./CustomImage";
import CustomVideo from "./CustomVideo";

interface FormFileUploadProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  accept: string;
  type?: "image" | "video" | "file";
  placeholder?: string;
  className?: string;
}

export function FormFileUpload<T extends FieldValues>({
  name,
  control,
  label,
  accept,
  type = "file",
  placeholder,
  className,
}: FormFileUploadProps<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getIcon = () => {
    switch (type) {
      case "image":
        return <Image className="h-8 w-8 text-muted-foreground" />;
      case "video":
        return <Video className="h-8 w-8 text-muted-foreground" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("relative mb-5", className)}>
          <FormLabel className="font-normal">{label}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : fieldState.error
                    ? "border-red-500 bg-red-50"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    handleFileSelect(files[0]);
                    field.onChange(files[0]);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                      field.onChange(file);
                    }
                  }}
                />

                {uploadedFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    {getIcon()}
                    <span>{uploadedFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-x-2 text-sm">
                    {getIcon()}
                    <span>Drop files here or click to upload</span>
                  </div>
                )}
              </div>

              {field.value && (
                <div className="mt-3 relative">
                  {type === "image" ? (
                    <CustomImage
                      src={field.value}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ) : type === "video" ? (
                    <CustomVideo
                      src={field.value}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ) : null}

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      clearFile();
                      field.onChange(null);
                    }}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </FormControl>

          <div className="absolute bottom-0 leading-4 translate-y-5 left-0">
            <FormMessage className="text-red-500 ms-1" />
          </div>
        </FormItem>
      )}
    />
  );
}
