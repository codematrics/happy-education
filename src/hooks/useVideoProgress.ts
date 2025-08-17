import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface VideoProgressData {
  courseId: string;
  videoId: string;
  watchTime: number;
  totalDuration: number;
  isCompleted?: boolean;
}

interface VideoProgressResponse {
  _id: string;
  userId: string;
  courseId: string;
  videoId: string;
  isCompleted: boolean;
  watchTime: number;
  totalDuration: number;
  lastWatchedAt: string;
  completedAt?: string;
}

interface CourseProgressResponse {
  courseProgress: {
    totalVideos: number;
    completedVideos: number;
    progressPercentage: number;
  };
  videoProgresses: VideoProgressResponse[];
}

export const useVideoProgress = (courseId?: string, videoId?: string) => {
  return useQuery({
    queryKey: ["videoProgress", courseId, videoId],
    queryFn: async (): Promise<{ data: VideoProgressResponse | CourseProgressResponse }> => {
      const params = new URLSearchParams();
      if (courseId) params.append("courseId", courseId);
      if (videoId) params.append("videoId", videoId);
      
      const response = await fetch(`/api/v1/video-progress?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch video progress");
      }
      return response.json();
    },
    enabled: !!(courseId || videoId),
  });
};

export const useCourseProgress = (courseId: string) => {
  return useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: async (): Promise<{ data: CourseProgressResponse }> => {
      const response = await fetch(`/api/v1/video-progress?courseId=${courseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch course progress");
      }
      return response.json();
    },
    enabled: !!courseId,
  });
};

export const useUpdateVideoProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VideoProgressData) => {
      const response = await fetch("/api/v1/video-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update video progress");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["videoProgress", variables.courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["courseProgress", variables.courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["myCourses"],
      });
    },
  });
};