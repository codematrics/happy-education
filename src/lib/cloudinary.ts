import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes?: number;
  bit_rate?: number;
  frame_rate?: number;
}

export interface CloudinaryAsset {
  publicId: string;
  url: string;
  duration?: number;
  format: string;
  width?: number;
  height?: number;
  bitrate?: number;
}

export const uploadToCloudinary = async (
  file: File,
  folder: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<UploadResult> => {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          allowed_formats:
            resourceType === "image"
              ? ["jpg", "jpeg", "png", "webp", "gif"]
              : ["mp4", "avi", "mov", "mkv", "webm"],
        },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              format: result.format,
              width: result.width,
              height: result.height,
              duration: result.duration,
            });
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    throw new Error(`Failed to upload to Cloudinary: ${error}`);
  }
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error(`Failed to delete from Cloudinary: ${error}`);
    // Don't throw error to prevent blocking database operations
  }
};

export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url || typeof url !== "string") return null;

  try {
    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/[cloud]/[resource_type]/[type]/[version]/[folder]/[public_id].[format]
    const urlParts = url.split("/");
    const cloudinaryIndex = urlParts.findIndex(
      (part) => part === "res.cloudinary.com"
    );

    if (cloudinaryIndex === -1) return null;

    // Get everything after the version/transformation part
    const relevantParts = urlParts.slice(cloudinaryIndex + 4); // Skip cloud name and resource info
    const lastPart = relevantParts[relevantParts.length - 1];

    // Remove file extension and extract public ID with folder path
    const publicIdWithExtension = relevantParts.join("/");
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // Remove extension

    return publicId;
  } catch (error) {
    console.error("Failed to extract public ID from URL:", error);
    return null;
  }
};

export const deleteFileFromUrl = async (
  urlOrAsset: string | CloudinaryAsset | any
): Promise<void> => {
  if (!urlOrAsset) return;

  let url: string;
  let publicId: string | null = null;

  // Handle CloudinaryAsset object
  if (typeof urlOrAsset === "object" && urlOrAsset.publicId) {
    publicId = urlOrAsset.publicId;
    url = urlOrAsset.url;
  } else if (typeof urlOrAsset === "object" && urlOrAsset.url) {
    // Handle backward compatibility object with url property
    url = urlOrAsset.url;
    publicId = extractPublicIdFromUrl(url);
  } else if (typeof urlOrAsset === "string") {
    // Handle plain URL string
    url = urlOrAsset;
    publicId = extractPublicIdFromUrl(url);
  } else {
    return;
  }

  if (!publicId) return;

  // Determine resource type from URL or file extension
  const isVideo =
    url.includes("/video/") || /\.(mp4|avi|mov|mkv|webm)$/i.test(url);
  const resourceType = isVideo ? "video" : "image";

  await deleteFromCloudinary(publicId, resourceType);
};

/**
 * Generate optimized Cloudinary URL with transformations
 */
export const generateCloudinaryUrl = (
  publicId: string,
  options: {
    resourceType?: "image" | "video";
    width?: number;
    height?: number;
    quality?: "auto" | "auto:low" | "auto:good" | "auto:best" | number;
    format?: "auto" | string;
    crop?: "fill" | "fit" | "scale" | "crop";
    gravity?: "auto" | "face" | "center";
    videoCodec?: "auto" | "h264" | "vp9";
    videoBitrate?: string;
  } = {}
): string => {
  const {
    resourceType = "image",
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "fill",
    gravity = "auto",
    videoCodec = "auto",
    videoBitrate,
  } = options;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error("Cloudinary cloud name not configured");

  let transformations: string[] = [];

  // Image/Video dimensions
  if (width || height) {
    let sizeTransform = "";
    if (width) sizeTransform += `w_${width}`;
    if (height) sizeTransform += (width ? "," : "") + `h_${height}`;
    if (crop) sizeTransform += `,c_${crop}`;
    if (gravity) sizeTransform += `,g_${gravity}`;
    transformations.push(sizeTransform);
  }

  // Quality and format
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  // Video-specific transformations
  if (resourceType === "video") {
    if (videoCodec) transformations.push(`vc_${videoCodec}`);
    if (videoBitrate) transformations.push(`br_${videoBitrate}`);
  }

  const transformString =
    transformations.length > 0 ? `/${transformations.join(",")}` : "";

  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload${transformString}/${publicId}`;
};

/**
 * Generate responsive image URLs for different screen sizes
 */
export const generateResponsiveImageUrls = (publicId: string) => {
  return {
    thumbnail: generateCloudinaryUrl(publicId, { width: 150, height: 100 }),
    small: generateCloudinaryUrl(publicId, { width: 400, height: 300 }),
    medium: generateCloudinaryUrl(publicId, { width: 800, height: 600 }),
    large: generateCloudinaryUrl(publicId, { width: 1200, height: 900 }),
    webp: generateCloudinaryUrl(publicId, { format: "webp", quality: "auto" }),
    avif: generateCloudinaryUrl(publicId, { format: "avif", quality: "auto" }),
  };
};

/**
 * Generate video URLs with different quality settings
 */
export const generateVideoUrls = (publicId: string) => {
  return {
    thumbnail: generateCloudinaryUrl(publicId, {
      resourceType: "video",
      width: 300,
      height: 200,
      format: "jpg",
    }),
    preview: generateCloudinaryUrl(publicId, {
      resourceType: "video",
      quality: "auto:low",
      videoBitrate: "500k",
    }),
    standard: generateCloudinaryUrl(publicId, {
      resourceType: "video",
      quality: "auto:good",
      videoBitrate: "1000k",
    }),
    hd: generateCloudinaryUrl(publicId, {
      resourceType: "video",
      quality: "auto:best",
      videoBitrate: "2000k",
    }),
  };
};

export const updateCloudinaryFile = async (
  publicId: string,
  newFile: File,
  folder: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<UploadResult> => {
  // Delete old file first
  await deleteFromCloudinary(publicId, resourceType);

  // Upload new file
  return uploadToCloudinary(newFile, folder, resourceType);
};

export const processFilesAndReturnUpdatedResults = async (
  keys: string[],
  json: Record<string, any>,
  folderPrefix: string,
  existingData?: Record<string, any>
) => {
  const results: Record<string, CloudinaryAsset | null | any> = {};

  for (const key of keys) {
    const file = json[key];
    if (!file) {
      results[key] = null;
      continue;
    }

    if (!(file instanceof File)) {
      // If it's a string URL and we have existing data, preserve the existing asset structure
      if (typeof file === 'string' && existingData && existingData[key]) {
        const existing = existingData[key];
        // Check if the URL matches the existing asset URL
        if (typeof existing === 'object' && existing.url === file) {
          // Preserve the existing asset structure
          results[key] = existing;
        } else if (typeof existing === 'string' && existing === file) {
          // Handle backward compatibility case
          results[key] = file;
        } else {
          // URL has changed but it's still a string, keep as string
          results[key] = file;
        }
      } else {
        // For non-file, non-string values or when no existing data
        results[key] = file;
      }
      continue;
    }

    const isImage = file && file.type.startsWith("image/");
    const isVideo = file && file.type.startsWith("video/");

    if (file) {
      const uploadResult = await uploadToCloudinary(
        file,
        `${folderPrefix}/${isImage ? "images" : isVideo ? "videos" : "files"}`,
        isImage ? "image" : isVideo ? "video" : "raw"
      );

      // Convert UploadResult to CloudinaryAsset
      results[key] = {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration,
        bitrate: uploadResult.bit_rate,
      } as CloudinaryAsset;
    }
  }

  return { ...json, ...results };
};
