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
    throw new Error(`Failed to delete from Cloudinary: ${error}`);
  }
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
