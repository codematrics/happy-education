/**
 * Format seconds into MM:SS or HH:MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get video duration from video element or URL
 * Note: This is a placeholder - in a real app you'd either:
 * 1. Store duration in database when video is uploaded (RECOMMENDED)
 * 2. Use a video metadata service like Cloudinary's video info API
 * 3. Load video element to get duration (browser-dependent)
 * 4. Use FFmpeg or similar to extract metadata server-side
 */
export function getVideoDuration(videoUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve(video.duration || 0);
      video.remove();
    };
    
    video.onerror = () => {
      resolve(0);
      video.remove();
    };
    
    video.src = videoUrl;
  });
}

/**
 * Calculate total duration from an array of durations
 * @param durations - Array of durations in seconds
 * @returns Total duration in seconds
 */
export function calculateTotalDuration(durations: number[]): number {
  return durations.reduce((total, duration) => total + (duration || 0), 0);
}

/**
 * Estimate video duration based on file size (very rough approximation)
 * This is just a fallback when we can't get real duration
 */
export function estimateVideoDuration(): number {
  // Return a random duration between 5-25 minutes for demo purposes
  // In a real app, you'd remove this and always use actual duration
  return Math.floor(Math.random() * 20 * 60) + (5 * 60); // 5-25 minutes in seconds
}