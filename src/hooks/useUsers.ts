import { fetcher } from "@/lib/fetch";
import { jsonToFormData } from "@/lib/formDataParser";
import { PaginationResult } from "@/lib/pagination";
import { ResponseInterface, User } from "@/types/types";
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
}

export const useUsers = (
  params: FetchCoursesParams = {}
): UseQueryResult<
  ResponseInterface<{
    items: User[];
    pagination: PaginationResult<User>["pagination"];
  }>
> => {
  const debouncedSearch = useDebounce(params.search || "", 500);

  const queryKey = useMemo(
    () => [
      "Users",
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
      items: User[];
      pagination: PaginationResult<User>["pagination"];
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
          items: User[];
          pagination: PaginationResult<User>["pagination"];
        }>
      >(`/api/v1/admin/users?${searchParams.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseInterface<null>, Error, string>({
    mutationFn: async (userId: string): Promise<ResponseInterface<null>> => {
      const response = await fetcher<ResponseInterface<null>>(
        `/api/v1/admin/users/${userId}`,
        {
          method: "PUT",
          body: jsonToFormData({ isBlocked: true }),
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Users"] });
      toast.success("User blocked successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to block user");
    },
  });
};

export const useVerifyUser = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseInterface<null>, Error, string>({
    mutationFn: async (userId: string): Promise<ResponseInterface<null>> => {
      const response = await fetcher<ResponseInterface<null>>(
        `/api/v1/admin/users/${userId}`,
        {
          method: "PUT",
          body: jsonToFormData({ isVerified: true }),
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Users"] });
      toast.success("User Verified successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify user");
    },
  });
};
