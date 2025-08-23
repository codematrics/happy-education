"use client";

import { fetcher } from "@/lib/fetch";
import { Course, ResponseInterface } from "@/types/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useMyCourseVideos = (
  courseId: string
): UseQueryResult<
  ResponseInterface<{
    course: Course;
  }>
> => {
  return useQuery<
    ResponseInterface<{
      course: Course;
    }>
  >({
    queryKey: [`course-video-${courseId}`, courseId],
    queryFn: () => {
      return fetcher<
        ResponseInterface<{
          course: Course;
        }>
      >(`/api/v1/videos/${courseId}`);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export default useMyCourseVideos;
