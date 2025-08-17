import { useMutation, useQueryClient } from "@tanstack/react-query";

interface OtpVerificationData {
  otp: string;
}

export const useSendProfileOtp = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/user/profile/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send OTP");
      }

      return response.json();
    },
  });
};

export const useVerifyProfileOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OtpVerificationData) => {
      const response = await fetch("/api/v1/user/profile/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify OTP");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate user profile query to refresh verification status
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};