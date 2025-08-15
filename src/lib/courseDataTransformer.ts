import { CloudinaryAsset } from './cloudinary';
import { Course } from '@/types/types';
import { CourseUpdateData, CourseVideoFormData } from '@/types/schema';
import { CourseCurrency } from '@/types/constants';

/**
 * Transform course data from API response format to form data format
 * Converts Cloudinary asset objects to URL strings for form compatibility
 */
export const transformCourseDataForForm = (course: Course): CourseUpdateData => {
  // Transform thumbnail from asset object to URL string (required field)
  const thumbnail = course.thumbnail 
    ? (typeof course.thumbnail === 'string' ? course.thumbnail : course.thumbnail.url)
    : '';

  const transformedData: CourseUpdateData = {
    name: course.name,
    description: course.description,
    price: course.price,
    currency: course.currency as CourseCurrency,
    thumbnail: thumbnail,
  };

  // Transform preview video from asset object to URL string
  if (course.previewVideo) {
    transformedData.previewVideo = typeof course.previewVideo === 'string'
      ? course.previewVideo
      : course.previewVideo.url;
  }

  // Transform course videos array
  if (course.courseVideos && Array.isArray(course.courseVideos)) {
    transformedData.courseVideos = course.courseVideos.map((video: any): CourseVideoFormData => ({
      _id: video._id,
      name: video.name,
      description: video.description,
      thumbnail: typeof video.thumbnail === 'string' 
        ? video.thumbnail 
        : video.thumbnail?.url || '',
      video: typeof video.video === 'string'
        ? video.video
        : video.video?.url || ''
    }));
  }

  return transformedData;
};

/**
 * Transform asset object to URL string
 */
export const getAssetUrlForForm = (asset: string | CloudinaryAsset | any): string => {
  if (!asset) return '';
  
  if (typeof asset === 'string') {
    return asset;
  }
  
  if (typeof asset === 'object' && asset.url) {
    return asset.url;
  }
  
  return '';
};