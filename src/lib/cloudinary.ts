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
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/[cloud]/[resource_type]/[type]/[version]/[folder]/[public_id].[format]
    const urlParts = url.split('/');
    const cloudinaryIndex = urlParts.findIndex(part => part === 'res.cloudinary.com');
    
    if (cloudinaryIndex === -1) return null;
    
    // Get everything after the version/transformation part
    const relevantParts = urlParts.slice(cloudinaryIndex + 4); // Skip cloud name and resource info
    const lastPart = relevantParts[relevantParts.length - 1];
    
    // Remove file extension and extract public ID with folder path
    const publicIdWithExtension = relevantParts.join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove extension
    
    return publicId;
  } catch (error) {
    console.error('Failed to extract public ID from URL:', error);
    return null;
  }
};

export const deleteFileFromUrl = async (url: string): Promise<void> => {
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) return;
  
  // Determine resource type from URL or file extension
  const isVideo = url.includes('/video/') || /\.(mp4|avi|mov|mkv|webm)$/i.test(url);
  const resourceType = isVideo ? 'video' : 'image';
  
  await deleteFromCloudinary(publicId, resourceType);
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
  folderPrefix: string
) => {
  const results: Record<string, string | null> = {};

  for (const key of keys) {
    const file = json[key];
    if (!file) {
      results[key] = null;
      continue;
    }

    if (!(file instanceof File)) {
      results[key] = file;
      continue;
    }

    const isImage = file && file.type.startsWith("image/");
    const isVideo = file && file.type.startsWith("video/");

    if (file) {
      results[key] = (
        await uploadToCloudinary(
          file,
          `${folderPrefix}/${
            isImage ? "images" : isVideo ? "videos" : "files"
          }`,
          isImage ? "image" : isVideo ? "video" : "raw"
        )
      ).secure_url;
    }
  }

  return { ...json, ...results };
};
