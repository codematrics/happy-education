import { z } from "zod";
import { CourseCurrency } from "./constants";

export const loginValidations = z.object({
  userName: z
    .string()
    .nonempty("Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine((val) => /[^a-zA-Z0-9]/.test(val), {
      message: "Password must contain at least one special character",
    }),
});

export const paginationValidations = z.object({
  page: z.number().min(1, "Page number is invalid"),
  limit: z.number().min(1, "limit number is invalid"),
});

const fileValidation = (allowedExtensions: string[]) =>
  z
    .any()
    .refine((file) => file instanceof File, {
      message: "File is required",
    })
    .refine(
      (file) =>
        allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext)),
      {
        message: `Only ${allowedExtensions.join(", ")} files are allowed`,
      }
    );

const courseVideoValidation = z.object({
  name: z.string().min(1, "Video name is required"),
  description: z.string().min(1, "Video description is required"),
  thumbnail: fileValidation([".jpg", ".jpeg", ".png", ".webp"]),
  video: fileValidation([".mp4", ".avi", ".mov", ".mkv"]),
});

export const courseValidations = z.object({
  name: z.string().min(1, "Course name is required"),
  description: z.string().min(1, "Course description is required"),
  thumbnail: fileValidation([".jpg", ".jpeg", ".png", ".webp"]),
  previewVideo: fileValidation([".mp4", ".avi", ".mov", ".mkv"]),
  price: z.number().positive("Price must be a positive number"),
  currency: z.nativeEnum(CourseCurrency),
  videos: z.array(courseVideoValidation).optional(),
});

export const courseUpdateValidations = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  thumbnail: fileValidation([".jpg", ".jpeg", ".png", ".webp"]).optional(),
  previewVideo: fileValidation([".mp4", ".avi", ".mov", ".mkv"]).optional(),
  price: z.number().positive().optional(),
  currency: z.nativeEnum(CourseCurrency).optional(),
});

export type LoginFormData = z.infer<typeof loginValidations>;
export type PaginationData = z.infer<typeof paginationValidations>;
export type CourseFormData = z.infer<typeof courseValidations>;
export type CourseVideoFormData = z.infer<typeof courseVideoValidation>;
export type CourseUpdateData = z.infer<typeof courseUpdateValidations>;
