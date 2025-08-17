"use client";

import { fetcher } from "@/lib/fetch";
import { PaginationResult } from "@/lib/pagination";
import { Course, ResponseInterface } from "@/types/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";
import useDebounce from "./use-debounce";

interface FetchMyCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useMyCourses = (
  params: FetchMyCoursesParams = {}
): UseQueryResult<
  ResponseInterface<{
    items: Course[];
    pagination: PaginationResult<Course>["pagination"];
  }>
> => {
  const debouncedSearch = useDebounce(params.search || "", 500);

  const queryKey = useMemo(
    () => [
      "my-courses",
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
      items: Course[];
      pagination: PaginationResult<Course>["pagination"];
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
          items: Course[];
          pagination: PaginationResult<Course>["pagination"];
        }>
      >(`/api/v1/my-courses?${searchParams.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export default useMyCourses;