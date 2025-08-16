import { fetcher } from "@/lib/fetch";
import { jsonToFormData } from "@/lib/formDataParser";
import { PaginationResult } from "@/lib/pagination";
import { userCreateFormData, userUpdateModalFormData } from "@/types/schema";
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
      >(`/api/v1/users?${searchParams.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseInterface<userCreateFormData>,
    Error,
    userCreateFormData
  >({
    mutationFn: async (
      data: userCreateFormData
    ): Promise<ResponseInterface<userCreateFormData>> => {
      const response = await fetcher<ResponseInterface<userCreateFormData>>(
        `/api/v1/users`,
        {
          method: "POST",
          body: jsonToFormData(data),
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Users"] });
      toast.success("User Created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create user");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseInterface<userUpdateModalFormData>,
    Error,
    { userId?: string | null; data: userUpdateModalFormData }
  >({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId?: string | null;
      data: userUpdateModalFormData;
    }): Promise<ResponseInterface<userUpdateModalFormData>> => {
      const response = await fetcher<
        ResponseInterface<userUpdateModalFormData>
      >(`/api/v1/users/${userId}`, {
        method: "PUT",
        body: jsonToFormData(data),
      });
      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["Users"] });
      queryClient.invalidateQueries({
        stale: false,
        predicate: (query) => {
          const [key, , , , , , qUserId, qIsPurchased] =
            query.queryKey as any[];
          return (
            key === "courses" &&
            qUserId === variables.userId &&
            qIsPurchased === true
          );
        },
      });
      toast.success("User Updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseInterface<null>, Error, string>({
    mutationFn: async (userId: string): Promise<ResponseInterface<null>> => {
      const response = await fetcher<ResponseInterface<null>>(
        `/api/v1/users/${userId}`,
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
        `/api/v1/users/${userId}`,
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
