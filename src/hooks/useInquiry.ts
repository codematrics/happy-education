import { fetcher } from "@/lib/fetch";
import { PaginationResult } from "@/lib/pagination";
import { Toast } from "@/lib/toast";
import { inquiryFormData } from "@/types/schema";
import { Inquiry, ResponseInterface } from "@/types/types";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";
import useDebounce from "./use-debounce";

interface FetchCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useInquiries = (
  params: FetchCoursesParams = {}
): UseQueryResult<
  ResponseInterface<{
    items: Inquiry[];
    pagination: PaginationResult<Inquiry>["pagination"];
  }>
> => {
  const debouncedSearch = useDebounce(params.search || "", 500);

  const queryKey = useMemo(
    () => [
      "Inquiries",
      params.page || 1,
      params.limit || 10,
      debouncedSearch,
      params.sortBy || "createdAt",
      params.sortOrder || "desc",
    ],
    [
      params.page,
      params.limit,
      debouncedSearch,
      params.sortBy,
      params.sortOrder,
    ]
  );

  return useQuery<
    ResponseInterface<{
      items: Inquiry[];
      pagination: PaginationResult<Inquiry>["pagination"];
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

      return fetcher<
        ResponseInterface<{
          items: Inquiry[];
          pagination: PaginationResult<Inquiry>["pagination"];
        }>
      >(`/api/v1/inquiry?${searchParams.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateInquiry = () => {
  return useMutation<ResponseInterface<Inquiry>, Error, inquiryFormData>({
    mutationFn: async (
      data: inquiryFormData
    ): Promise<ResponseInterface<Inquiry>> => {
      const response = await fetcher<ResponseInterface<Inquiry>>(
        `/api/v1/inquiry`,
        {
          method: "POST",
          body: data,
        }
      );
      return response;
    },
    onSuccess: () => {
      Toast.success("Inquiry Sent successfully");
    },
    onError: (error) => {
      Toast.error(error.message || "Failed to sens inquiry");
    },
  });
};
