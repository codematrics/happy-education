import { CloudinaryAsset } from './cloudinary';

/**
 * Safely extract URL from asset object or return string URL
 */
export const getAssetUrl = (asset: string | CloudinaryAsset | any): string => {
  if (!asset) return '';
  
  if (typeof asset === 'string') {
    return asset;
  }
  
  if (typeof asset === 'object' && asset.url) {
    return asset.url;
  }
  
  return '';
};

/**
 * Safely extract public ID from asset object
 */
export const getAssetPublicId = (asset: string | CloudinaryAsset | any): string => {
  if (!asset) return '';
  
  if (typeof asset === 'object' && asset.publicId) {
    return asset.publicId;
  }
  
  return '';
};

/**
 * Check if two assets are different (for comparison in updates)
 */
export const areAssetsDifferent = (
  asset1: string | CloudinaryAsset | any, 
  asset2: string | CloudinaryAsset | any
): boolean => {
  const publicId1 = getAssetPublicId(asset1);
  const publicId2 = getAssetPublicId(asset2);
  
  // If both have public IDs, compare them
  if (publicId1 && publicId2) {
    return publicId1 !== publicId2;
  }
  
  // Fallback to URL comparison for backward compatibility
  const url1 = getAssetUrl(asset1);
  const url2 = getAssetUrl(asset2);
  
  return url1 !== url2;
};