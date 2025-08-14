import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { File, Image, Upload, Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { FormItem, FormLabel } from "../ui/form";

interface FileUploadProps {
  label: string;
  accept: string;
  value?: string;
  onChange: (file: File | null, url?: string) => void;
  placeholder?: string;
  type?: "image" | "video" | "file";
  className?: string;
}

const FileUpload = ({
  label,
  accept,
  value,
  onChange,
  placeholder,
  type = "file",
  className,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    onChange(file, fileUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPreviewUrl("");
    onChange(null, "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    setUploadedFile(null);
    onChange(null, url);
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
    <FormItem>
      <div className={cn("space-y-3", className)}>
        <FormLabel className="font-medium">{label}</FormLabel>

        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          {uploadedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                {getIcon()}
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: {accept.replace(/\./g, "").toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="relative">
            {type === "image" ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border"
              />
            ) : type === "video" ? (
              <video
                src={previewUrl}
                controls
                className="w-full h-32 object-cover rounded-lg border"
              />
            ) : null}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={clearFile}
              className="absolute top-2 right-2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Or enter URL:</Label>
          <Input
            value={previewUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            className="h-10"
          />
        </div>
      </div>
    </FormItem>
  );
};

export default FileUpload;
