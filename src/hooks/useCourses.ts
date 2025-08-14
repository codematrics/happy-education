import { getCourses } from "@/lib/api";
import { PaginationResult } from "@/lib/pagination";
import { CourseFormData } from "@/types/schema";
import { ResponseInterface } from "@/types/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  thumbnail?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

interface FetchCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useCourses = (
  params: FetchCoursesParams = {}
): UseQueryResult<
  ResponseInterface<{
    items: CourseFormData[];
    pagination: PaginationResult<CourseFormData>["pagination"];
  }>
> => {
  return useQuery<
    ResponseInterface<{
      items: CourseFormData[];
      pagination: PaginationResult<CourseFormData>["pagination"];
    }>
  >({
    queryKey: ["courses", params.page, params.limit, params.search],
    queryFn: () => getCourses(params.page, params.limit, params.search),
  });
};

// Create course mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Course>) => {
      const response = await fetch("/api/v1/course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create course");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create course");
    },
  });
};

// Update course mutation
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Course> }) => {
      const response = await fetch(`/api/v1/course/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update course");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update course");
    },
  });
};

// Delete course mutation
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/course/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete course");
      }

      return response.json();
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
