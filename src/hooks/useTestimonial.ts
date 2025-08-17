import { fetcher } from "@/lib/fetch";
import { PaginationResult } from "@/lib/pagination";
import { Toast } from "@/lib/toast";
import { CourseFormData, TestimonialFormData } from "@/types/schema";
import { ResponseInterface, Testimonial } from "@/types/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

interface FetchCoursesParams {
  page?: number;
  limit?: number;
  courseId?: string | null;
}

export const useTestimonials = (
  params: FetchCoursesParams = {}
): UseQueryResult<
  ResponseInterface<{
    items: Testimonial[];
    pagination: PaginationResult<CourseFormData>["pagination"];
  }>
> => {
  const queryKey = useMemo(
    () => [
      "testimonials",
      params.page || 1,
      params.limit || 10,
      params.courseId || "",
    ],
    [params.page, params.limit, params.courseId]
  );

  return useQuery<
    ResponseInterface<{
      items: Testimonial[];
      pagination: PaginationResult<CourseFormData>["pagination"];
    }>
  >({
    queryKey,
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.courseId) searchParams.set("courseId", params.courseId);

      return fetcher<
        ResponseInterface<{
          items: Testimonial[];
          pagination: PaginationResult<CourseFormData>["pagination"];
        }>
      >(`/api/v1/testimonial?${searchParams.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      const response = await fetcher("/api/v1/testimonial", {
        method: "POST",
        body: data,
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      Toast.success("Testimonial created successfully");
    },
    onError: (error) => {
      Toast.error(error.message || "Failed to create course");
    },
  });
};

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseInterface<TestimonialFormData>,
    Error,
    { testimonialId: string; data: TestimonialFormData }
  >({
    mutationFn: async ({ testimonialId, data }) => {
      const response = await fetcher<ResponseInterface<TestimonialFormData>>(
        `/api/v1/testimonial/${testimonialId}`,
        {
          method: "PUT",
          body: data,
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      Toast.success("Testimonial updated successfully");
    },
    onError: (error) => {
      Toast.error(error.message || "Failed to update testimonial");
    },
  });
};

export const useTestimonial = (id?: string) => {
  return useQuery<ResponseInterface<Testimonial>>({
    queryKey: ["testimonial", id],
    queryFn: () =>
      fetcher<ResponseInterface<Testimonial>>(`/api/v1/testimonial/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseInterface<null>, Error, string>({
    mutationFn: async (id: string): Promise<ResponseInterface<null>> => {
      const response = await fetcher<ResponseInterface<null>>(
        `/api/v1/testimonial/${id}`,
        {
          method: "DELETE",
        }
      );

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete testimonial");
    },
  });
};
