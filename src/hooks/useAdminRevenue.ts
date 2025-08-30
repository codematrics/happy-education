"use client";

import { fetcher } from "@/lib/fetch";
import { Toast } from "@/lib/toast";
import { ResponseInterface } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  successRate: string;
}

interface TopSellingCourse {
  courseId: string;
  courseName: string;
  price: number;
  accessType: string;
  totalSales: number;
  totalRevenue: number;
}

interface MonthlyRevenue {
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  transactions: number;
}

interface AdminTransaction {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    name: string;
    price: number;
    accessType: string;
  };
  createdAt: string;
}

interface RevenueResponse {
  statistics: RevenueStats;
  transactions: AdminTransaction[];
  topSellingCourses: TopSellingCourse[];
  monthlyRevenue: MonthlyRevenue[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
}

interface RevenueParams {
  page?: number;
  limit?: number;
  courseId?: string;
  startDate?: string;
  endDate?: string;
  status?: "success" | "failed" | "pending";
}

interface ExportParams {
  startDate?: string;
  endDate?: string;
  courseId?: string;
  status?: "success" | "failed" | "pending";
}

export const useAdminRevenue = (params: RevenueParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.courseId) queryParams.set("courseId", params.courseId);
  if (params.startDate) queryParams.set("startDate", params.startDate);
  if (params.endDate) queryParams.set("endDate", params.endDate);
  if (params.status) queryParams.set("status", params.status);

  return useQuery<ResponseInterface<RevenueResponse>>({
    queryKey: ["admin-revenue", params],
    queryFn: () =>
      fetcher<ResponseInterface<RevenueResponse>>(
        `/api/v1/admin/revenue?${queryParams.toString()}`
      ),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useExportRevenue = () => {
  return useMutation<Blob, Error, ExportParams>({
    mutationFn: async (params: ExportParams) => {
      const response = await fetch("/api/v1/admin/revenue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to export revenue data");
      }

      return response.blob();
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `revenue-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Toast.success("Revenue report downloaded successfully");
    },
    onError: (error) => {
      Toast.error(error.message || "Failed to export revenue data");
    },
  });
};

// Get revenue summary for dashboard cards
export const useRevenueSummary = () => {
  return useQuery<ResponseInterface<RevenueStats>>({
    queryKey: ["revenue-summary"],
    queryFn: () =>
      fetcher<ResponseInterface<RevenueStats>>(
        "/api/v1/admin/revenue?summary=true"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export default {
  useAdminRevenue,
  useExportRevenue,
  useRevenueSummary,
};
