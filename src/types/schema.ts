import { z } from "zod";
import { AuthIdentifiers, CourseCurrency } from "./constants";

export const loginAdminValidations = z.object({
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

export const loginUserValidations = z.object({
  identifier: z
    .string()
    .min(1, "Email or mobile number is required")
    .refine(
      (value) => /^\S+@\S+\.\S+$/.test(value) || /^[0-9]{10}$/.test(value),
      {
        message: "Must be a valid email address or 10-digit mobile number",
      }
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupUserValidations = z
  .object({
    identifier: z.nativeEnum(AuthIdentifiers),

    email: z.string().email("Invalid email").optional().or(z.literal("")),
    mobile: z
      .string()
      .regex(/^[0-9]{10}$/, "Invalid mobile number")
      .optional()
      .or(z.literal("")),

    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),

    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  })
  .refine(
    (data) =>
      (data.identifier === AuthIdentifiers.email && !!data.email) ||
      (data.identifier === AuthIdentifiers.phone && !!data.mobile),
    {
      message: "Email or mobile number is required based on identifier",
      path: ["identifier"],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const newPasswordValidations = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const forgotPasswordValidations = z.object({
  identifier: z
    .string()
    .min(1, "Email or mobile number is required")
    .refine(
      (value) => /^\S+@\S+\.\S+$/.test(value) || /^[0-9]{10}$/.test(value),
      {
        message: "Must be a valid email address or 10-digit mobile number",
      }
    ),
});

export const otpValidations = z.object({
  otp: z.string().length(4, "OTP must be 4 digits"),
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

export const userUpdateValidations = z.object({
  email: z.string().email("Invalid email address").optional(),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .optional(),
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .optional(),
  isBlocked: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  purchasedCourses: z.array(z.string()).optional(),
});

export const userUpdateFormValidations = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .or(z.literal("")),
  isBlocked: z.boolean(),
  isVerified: z.boolean(),
  purchasedCourses: z.array(z.string()).optional(),
  selectedCourse: z.any(),
});

export const userCreateValidations = z
  .object({
    identifier: z.nativeEnum(AuthIdentifiers),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    mobileNumber: z
      .string()
      .regex(/^[0-9]{10}$/, "Invalid mobile number")
      .optional()
      .or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    isVerified: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
    selectedCourse: z.any(),
  })
  .refine(
    (data) =>
      (data.identifier === AuthIdentifiers.email && !!data.email) ||
      (data.identifier === AuthIdentifiers.phone && !!data.mobileNumber),
    {
      message: "Email or mobile number is required based on identifier",
      path: ["identifier"],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const testimonialCreateSchema = z.object({
  thumbnail: optionalFileOrUrlValidation([".jpg", ".jpeg", ".png", ".webp"]),
  video: requiredFileOrUrlValidation([".mp4", ".avi", ".mov", ".mkv"]),
  courseId: z.array(z.string()).min(1, "At least one course is required."),
  selectedCourse: z.any(),
});

export const testimonialApiUpdateSchema = z.object({
  thumbnail: optionalFileOrUrlValidation([".jpg", ".jpeg", ".png", ".webp"]),
  video: optionalFileOrUrlValidation([".mp4", ".avi", ".mov", ".mkv"]),
  courseId: z.array(z.string()).optional(),
});

export const testimonialUpdateSchema = z.object({
  thumbnail: optionalFileOrUrlValidation([".jpg", ".jpeg", ".png", ".webp"]),
  video: requiredFileOrUrlValidation([".mp4", ".avi", ".mov", ".mkv"]),
  courseId: z.array(z.string()).min(1, "At least one course is required."),
});

export type userUpdateFormData = z.infer<typeof userUpdateValidations>;
export type TestimonialFormData = z.infer<typeof testimonialCreateSchema>;
export type TestimonialApiUpdateFormData = z.infer<
  typeof testimonialApiUpdateSchema
>;
export type userUpdateModalFormData = z.infer<typeof userUpdateFormValidations>;
export type userCreateFormData = z.infer<typeof userCreateValidations>;
export type SignUpUserFormData = z.infer<typeof signupUserValidations>;
export type LoginAdminFormData = z.infer<typeof loginAdminValidations>;
export type LoginUserFormData = z.infer<typeof loginUserValidations>;
export type OtpFormData = z.infer<typeof otpValidations>;
export type NewPasswordFormData = z.infer<typeof newPasswordValidations>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordValidations>;
export type PaginationData = z.infer<typeof paginationValidations>;
export type CourseFormData = z.infer<typeof courseValidations>;
export type CourseVideoFormData = z.infer<typeof courseVideoValidation>;
export type CourseUpdateData = z.infer<typeof courseUpdateValidations>;
