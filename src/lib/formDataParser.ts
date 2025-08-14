import { uploadToCloudinary } from "./cloudinary";
import { z } from "zod";

export interface ParsedFormData {
  [key: string]: any;
}

export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: any;
}

// Helper function to validate non-file fields first
const validateNonFileFields = (
  formData: FormData,
  schema: z.ZodSchema
): ValidationResult => {
  const nonFileData: ParsedFormData = {};
  const fileFields: { [key: string]: File } = {};

  // Separate file and non-file fields
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      fileFields[key] = value;
    } else {
      if (key === "price") {
        const parsed = parseFloat(value as string);
        if (isNaN(parsed)) {
          return {
            success: false,
            errors: { [key]: ["Invalid price format"] },
          };
        }
        nonFileData[key] = parsed;
      } else {
        nonFileData[key] = value;
      }
    }
  }

  // Create a temporary schema for validation that makes file fields optional
  const tempSchema = schema.partial();
  
  // For each file field, add a placeholder to pass basic validation
  Object.keys(fileFields).forEach(key => {
    nonFileData[key] = fileFields[key]; // Keep file for file-specific validation
  });

  const validation = tempSchema.safeParse(nonFileData);
  
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  return {
    success: true,
    data: { nonFileData, fileFields },
  };
};

export const parseFormDataToJson = async (
  formData: FormData,
  schema: z.ZodSchema
): Promise<ParsedFormData> => {
  // Step 1: Validate non-file fields first
  const preValidation = validateNonFileFields(formData, schema);
  
  if (!preValidation.success) {
    throw new Error(
      `Validation failed: ${JSON.stringify(preValidation.errors)}`
    );
  }

  const { nonFileData, fileFields } = preValidation.data;
  const result: ParsedFormData = { ...nonFileData };

  // Step 2: Validate and upload files only after other validations pass
  for (const [key, file] of Object.entries(fileFields)) {
    // Skip empty files
    if (file.size === 0) {
      throw new Error(`File ${key} is empty`);
    }

    // Validate file type based on field name
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'];

    let isValidType = false;
    let folder = "uploads";
    let resourceType: "image" | "video" = "image";

    if (key.toLowerCase().includes("video") || key.toLowerCase().includes("preview")) {
      isValidType = allowedVideoTypes.includes(file.type);
      folder = "courses/videos";
      resourceType = "video";
    } else if (
      key.toLowerCase().includes("thumbnail") ||
      key.toLowerCase().includes("image")
    ) {
      isValidType = allowedImageTypes.includes(file.type);
      folder = "courses/thumbnails";
      resourceType = "image";
    }

    if (!isValidType) {
      throw new Error(
        `Invalid file type for ${key}. Expected ${
          resourceType === "video" ? "video" : "image"
        } file.`
      );
    }

    // Validate file size (5MB for images, 50MB for videos)
    const maxSize = resourceType === "video" ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(
        `File ${key} is too large. Maximum size is ${
          resourceType === "video" ? "50MB" : "5MB"
        }`
      );
    }

    try {
      const uploadResult = await uploadToCloudinary(
        file,
        folder,
        resourceType
      );
      result[key] = uploadResult.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload ${key}: ${error}`);
    }
  }

  return result;
};

export const parseFormDataForUpdate = async (
  formData: FormData,
  schema: z.ZodSchema
): Promise<ParsedFormData> => {
  const nonFileData: ParsedFormData = {};
  const fileFields: { [key: string]: File } = {};

  // Step 1: Separate and validate non-file fields
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      fileFields[key] = value;
    } else if (value !== "" && value !== "undefined" && value !== "null") {
      if (key === "price") {
        const parsed = parseFloat(value as string);
        if (isNaN(parsed)) {
          throw new Error(`Invalid price format: ${value}`);
        }
        nonFileData[key] = parsed;
      } else {
        nonFileData[key] = value;
      }
    }
  }

  // Step 2: Validate non-file data with partial schema (for updates)
  const partialSchema = schema.partial();
  const validation = partialSchema.safeParse(nonFileData);
  
  if (!validation.success) {
    throw new Error(
      `Validation failed: ${JSON.stringify(validation.error.flatten().fieldErrors)}`
    );
  }

  const result: ParsedFormData = { ...nonFileData };

  // Step 3: Process file uploads only after validation passes
  for (const [key, file] of Object.entries(fileFields)) {
    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'];

    let isValidType = false;
    let folder = "uploads";
    let resourceType: "image" | "video" = "image";

    if (key.toLowerCase().includes("video") || key.toLowerCase().includes("preview")) {
      isValidType = allowedVideoTypes.includes(file.type);
      folder = "courses/videos";
      resourceType = "video";
    } else if (
      key.toLowerCase().includes("thumbnail") ||
      key.toLowerCase().includes("image")
    ) {
      isValidType = allowedImageTypes.includes(file.type);
      folder = "courses/thumbnails";
      resourceType = "image";
    }

    if (!isValidType) {
      throw new Error(
        `Invalid file type for ${key}. Expected ${
          resourceType === "video" ? "video" : "image"
        } file.`
      );
    }

    // Validate file size
    const maxSize = resourceType === "video" ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(
        `File ${key} is too large. Maximum size is ${
          resourceType === "video" ? "50MB" : "5MB"
        }`
      );
    }

    try {
      const uploadResult = await uploadToCloudinary(
        file,
        folder,
        resourceType
      );
      result[key] = uploadResult.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload ${key}: ${error}`);
    }
  }

  return result;
};
