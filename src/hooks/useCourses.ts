import { getCourseById } from "@/lib/api";
import { fetcher } from "@/lib/fetch";
import { jsonToFormData } from "@/lib/formDataParser";
import { PaginationResult } from "@/lib/pagination";
import { Toast } from "@/lib/toast";
import { CourseFormData, CourseUpdateData } from "@/types/schema";
import { Course, ResponseInterface } from "@/types/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import useDebounce from "./use-debounce";

interface FetchCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  userId?: string | null;
  isIncludePurchased?: boolean;
}

export const useCourses = (
  params: FetchCoursesParams = {}
): UseQueryResult<
  ResponseInterface<{
    items: Course[];
    pagination: PaginationResult<CourseFormData>["pagination"];
  }>
> => {
  const debouncedSearch = useDebounce(params.search || "", 500);

  const queryKey = useMemo(
    () => [
      "courses",
      params.page || 1,
      params.limit || 10,
      debouncedSearch,
      params.sortBy || "createdAt",
      params.sortOrder || "desc",
      params.userId || "",
      params.isIncludePurchased || false,
    ],
    [
      params.page,
      params.limit,
      debouncedSearch,
      params.sortBy,
      params.sortOrder,
      params.userId,
      params.isIncludePurchased,
    ]
  );

  return useQuery<
    ResponseInterface<{
      items: Course[];
      pagination: PaginationResult<CourseFormData>["pagination"];
    }>
  >({
    queryKey,
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (debouncedSearch) searchParams.set("search", debouncedSearch);
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
      if (params.isIncludePurchased)
        searchParams.set(
          "isIncludePurchased",
          String(params.isIncludePurchased)
        );
      if (params.userId) searchParams.set("userId", params.userId);

      return fetcher<
        ResponseInterface<{
          items: Course[];
          pagination: PaginationResult<CourseFormData>["pagination"];
        }>
      >(`/api/v1/course?${searchParams.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCourse = (
  courseId?: string
): UseQueryResult<ResponseInterface<Course>> => {
  return useQuery<ResponseInterface<Course>>({
    queryKey: [courseId, courseId],
    queryFn: () => getCourseById(courseId),
    staleTime: 1000 * 60 * 5,
    enabled: !!courseId,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CourseFormData) => {
      const formData = jsonToFormData(data);

      const response = await fetcher("/api/v1/course", {
        method: "POST",
        body: formData,
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      Toast.success("Course created successfully");
    },
    onError: (error) => {
      Toast.error(error.message || "Failed to create course");
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseInterface<CourseUpdateData>,
    Error,
    { courseId: string; data: CourseUpdateData }
  >({
    mutationFn: async ({ courseId, data }) => {
      const formData = jsonToFormData(data);
      const response = await fetcher<ResponseInterface<CourseUpdateData>>(
        `/api/v1/course/${courseId}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      Toast.success("Course updated successfully");
    },
    onError: (error) => {
      Toast.error(error.message || "Failed to update course");
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseInterface<null>, Error, string>({
    mutationFn: async (id: string): Promise<ResponseInterface<null>> => {
      const response = await fetcher<ResponseInterface<null>>(
        `/api/v1/course/${id}`,
        {
          method: "DELETE",
        }
      );

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete course");
    },
  });
};
