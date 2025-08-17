import { CloudinaryAsset } from "./cloudinary";

/**
 * Transform course data from API response format to form data format
 * Converts Cloudinary asset objects to URL strings for form compatibility
 */

/**
 * Transform asset object to URL string
 */
export const getAssetUrlForForm = (
  asset: string | CloudinaryAsset | any
): string => {
  if (!asset) return "";

  if (typeof asset === "string") {
    return asset;
  }

  if (typeof asset === "object" && asset.url) {
    return asset.url;
  }

  return "";
};
