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
const requiredFileOrUrlValidation = (allowedExtensions: string[]) =>
  z
    .any()
    .refine((value) => value instanceof File || typeof value === "string", {
      message: "File or URL is required",
    })
    .refine(
      (value) =>
        typeof value === "string" ||
        allowedExtensions.some((ext) =>
          value.name?.toLowerCase().endsWith(ext)
        ),
      {
        message: `Only ${allowedExtensions.join(", ")} files are allowed`,
      }
    );

const optionalFileOrUrlValidation = (allowedExtensions: string[]) =>
  z
    .any()
    .optional()
    .nullable()
    .refine(
      (value) => !value || value instanceof File || typeof value === "string",
      { message: "Invalid file or URL" }
    )
    .refine(
      (value) =>
        !value ||
        typeof value === "string" ||
        allowedExtensions.some((ext) =>
          value.name?.toLowerCase().endsWith(ext)
        ),
      {
        message: `Only ${allowedExtensions.join(", ")} files are allowed`,
      }
    );

export const courseVideoValidation = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Video name is required"),
  description: z.string().min(1, "Video description is required"),
  thumbnail: requiredFileOrUrlValidation([".jpg", ".jpeg", ".png", ".webp"]),
  video: requiredFileOrUrlValidation([".mp4", ".avi", ".mov", ".mkv"]),
});

export const courseValidations = z.object({
  name: z.string().min(1, "Course name is required"),
  description: z.string().min(1, "Course description is required"),
  thumbnail: requiredFileOrUrlValidation([".jpg", ".jpeg", ".png", ".webp"]),
  previewVideo: optionalFileOrUrlValidation([".mp4", ".avi", ".mov", ".mkv"]),
  price: z.number().positive("Price must be a positive number"),
  currency: z.nativeEnum(CourseCurrency),
  courseVideos: z.array(courseVideoValidation).optional(),
});

export const courseUpdateValidations = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  thumbnail: requiredFileOrUrlValidation([".jpg", ".jpeg", ".png", ".webp"]),
  previewVideo: optionalFileOrUrlValidation([".mp4", ".avi", ".mov", ".mkv"]),
  price: z.number().positive().optional(),
  currency: z.nativeEnum(CourseCurrency).optional(),
  courseVideos: z.array(courseVideoValidation).optional(),
});

export type LoginFormData = z.infer<typeof loginValidations>;
export type PaginationData = z.infer<typeof paginationValidations>;
export type CourseFormData = z.infer<typeof courseValidations>;
export type CourseVideoFormData = z.infer<typeof courseVideoValidation>;
export type CourseUpdateData = z.infer<typeof courseUpdateValidations>;
