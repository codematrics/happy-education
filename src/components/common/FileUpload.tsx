"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { fetcher } from "@/lib/fetch";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Cloud,
  File,
  Image,
  Loader2,
  Upload,
  Video,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import CustomImage from "./CustomImage";
import CustomVideo from "./CustomVideo";

// Cloudinary upload hook
const useCloudinaryUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(
    async (file: File, folder: string = "happy-education") => {
      try {
        setIsUploading(true);
        setProgress(0);
        setError(null);

        abortControllerRef.current = new AbortController();

        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"
        );
        formData.append("folder", folder);

        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 10;
          });
        }, 200);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${
            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"
          }/auto/upload`,
          {
            method: "POST",
            body: formData,
            signal: abortControllerRef.current.signal,
          }
        );

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        setProgress(100);

        return {
          publicId: result.public_id,
          url: result.secure_url,
          format: result.format,
          duration: result.duration,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        };
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          setError("Upload cancelled");
          return null;
        }
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setError(errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    abortControllerRef.current = null;
  }, []);

  return {
    isUploading,
    progress,
    error,
    uploadFile,
    cancelUpload,
    reset,
  };
};

interface FormFileUploadProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  accept: string;
  type?: "image" | "video" | "file";
  className?: string;
  folder?: string;
  autoUpload?: boolean;
  deleteFromCloudinary?: boolean;
}

const deleteFromCloudinary = async (publicId: string) => {
  try {
    await fetcher(`/api/v1/cloudinary/${publicId}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.error("Failed to delete from Cloudinary:", err);
  }
};

export function FormFileUpload<T extends FieldValues>({
  name,
  control,
  label,
  accept,
  type = "file",
  className,
  folder = "uploads",
  autoUpload = true,
}: FormFileUploadProps<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isUploading, progress, error, uploadFile, cancelUpload, reset } =
    useCloudinaryUpload();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const handleFileSelect = async (file: File) => {
          if (autoUpload) {
            try {
              const result = await uploadFile(file, folder);
              if (result) {
                field.onChange(result); // ✅ directly store result
              }
            } catch (error) {
              console.error("Upload failed:", error);
            }
          }
        };

        const clearFile = async () => {
          if (field.value?.publicId) {
            await deleteFromCloudinary(field.value.publicId);
          }
          reset();
          if (fileInputRef.current) fileInputRef.current.value = "";
          field.onChange(null);
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
          <FormItem className={cn("relative mb-5", className)}>
            <FormLabel className="font-normal">{label}</FormLabel>
            <FormControl>
              <div className="space-y-3">
                {/* Upload Area */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden",
                    isDragging
                      ? "border-primary bg-primary/5 scale-105 shadow-lg"
                      : fieldState.error
                      ? "border-red-500 bg-red-50"
                      : "border-border hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md"
                  )}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleFileSelect(files[0]);
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
                      }
                    }}
                  />

                  {field.value ? (
                    <div className="relative z-10 flex items-center justify-center space-x-3">
                      <div className="relative">{getIcon()}</div>
                      <p className="font-medium text-foreground">
                        Uploaded file
                      </p>
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
                      <div className="relative">
                        <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                          <Cloud className="h-4 w-4 text-primary/60" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          Drop files here or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center justify-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>Direct to Cloudinary</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm font-medium">
                          Uploading to Cloudinary...
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelUpload}
                        className="h-7 px-2 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Success Preview */}
                {field.value?.url && !isUploading && !error && (
                  <div className="mt-3 relative">
                    {type === "image" ? (
                      <CustomImage
                        src={field.value.url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border shadow-sm"
                      />
                    ) : type === "video" ? (
                      <CustomVideo
                        src={field.value.url}
                        className="w-full h-32 object-cover rounded-lg border shadow-sm"
                      />
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={clearFile}
                      className="absolute top-2 right-2 h-6 w-6 p-0 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        Upload failed
                      </span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={reset}
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-800 mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </FormControl>
            <div className="absolute bottom-0 leading-4 translate-y-5 left-0">
              <FormMessage className="text-red-500 ms-1" />
            </div>
          </FormItem>
        );
      }}
    />
  );
}
