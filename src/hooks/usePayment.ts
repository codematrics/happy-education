"use client";

import { fetcher } from "@/lib/fetch";
import { Toast } from "@/lib/toast";
import { ResponseInterface } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface CheckoutResponse {
  orderId: string;
  amount: number;
  currency: string;
  course: {
    id: string;
    name: string;
    price: number;
    currency: string;
    accessType: string;
  };
  razorpayKeyId: string;
  transactionId: string;
  userEmail: string;
  isLoggedIn: boolean;
}

interface CheckoutRequest {
  courseId: string;
  userEmail?: string;
}

interface PaymentVerificationRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  userEmail?: string;
}

interface PaymentVerificationResponse {
  transactionId: string;
  paymentId: string;
  orderId: string;
  course: {
    id: string;
    name: string;
    accessType: string;
  };
  user: {
    id: string;
    email: string;
    isNewUser: boolean;
  };
  access: {
    purchaseDate: Date;
    expiryDate: Date | null;
    hasLifetimeAccess: boolean;
  };
  autoLogin?: boolean;
}

interface Transaction {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  paymentMethod: string;
  course: {
    id: string;
    name: string;
    thumbnail: { publicId: string; url: string };
    price: number;
    accessType: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
}

interface UserTransactionsParams {
  page?: number;
  limit?: number;
  status?: "success" | "failed" | "pending";
}

export const useCreateCheckout = () => {
  return useMutation<
    ResponseInterface<CheckoutResponse>,
    Error,
    CheckoutRequest
  >({
    mutationFn: async (data: CheckoutRequest) => {
      const response = await fetcher<ResponseInterface<CheckoutResponse>>(
        "/api/v1/checkout",
        {
          method: "POST",
          body: data,
        }
      );
      return response;
    },
    onError: (error) => {
      Toast.error(error.message || "Failed to create checkout");
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ResponseInterface<PaymentVerificationResponse>,
    Error,
    PaymentVerificationRequest
  >({
    mutationFn: async (payload: PaymentVerificationRequest) => {
      const response = await fetcher<
        ResponseInterface<PaymentVerificationResponse>
      >("/api/v1/payment/verify", {
        method: "POST",
        body: payload,
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["auth-check"], stale: false });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["user-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      queryClient.invalidateQueries({
        queryKey: [data.data.course.id, data.data.course.id, true],
      });

      Toast.success(data.message || "Payment successful!");

      const params = new URLSearchParams({
        transactionId: data.data.transactionId,
        courseId: data.data.course.id,
        courseName: data.data.course.name,
        newUser: data.data.user.isNewUser?.toString(),
        email: data.data.user.email,
      });

      router.push(`/payment/success?${params.toString()}`);
    },
    onError: (error) => {
      Toast.error(error.message || "Payment verification failed");
    },
  });
};

export const useUserTransactions = (params: UserTransactionsParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.status) queryParams.set("status", params.status);

  return useQuery<ResponseInterface<TransactionsResponse>>({
    queryKey: [
      "user-transactions",
      params.page || 1,
      params.limit || 10,
      params.status || "all",
    ],
    queryFn: () =>
      fetcher<ResponseInterface<TransactionsResponse>>(
        `/api/v1/user/transactions?${queryParams.toString()}`
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDownloadReceipt = () => {
  return useMutation<void, Error, string>({
    mutationFn: async (transactionId: string) => {
      // First get the receipt URL
      const urlResponse = await fetcher<
        ResponseInterface<{
          receiptUrl: string;
          receiptJsonUrl: string;
          transactionId: string;
          orderId: string;
        }>
      >(`/api/v1/user/transactions/${transactionId}/receipt-url`);

      if (!urlResponse.status || !urlResponse.data) {
        throw new Error("Failed to get receipt URL");
      }

      // Open the receipt in a new tab
      window.open(urlResponse.data.receiptUrl, "_blank");
    },
    onSuccess: () => {
      Toast.success("Receipt opened successfully");
    },
    onError: (error) => {
      Toast.error(error.message || "Failed to open receipt");
    },
  });
};

// Get receipt data for preview
export const useReceiptData = (transactionId: string) => {
  return useQuery({
    queryKey: ["receipt", transactionId],
    queryFn: () =>
      fetcher(`/api/v1/user/transactions/${transactionId}/receipt?format=json`),
    enabled: !!transactionId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export default {
  useCreateCheckout,
  useVerifyPayment,
  useUserTransactions,
  useDownloadReceipt,
  useReceiptData,
};
