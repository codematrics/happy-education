"use client";

import { fetcher } from "@/lib/fetch";
import { LoginFormData } from "@/types/schema";
import { useMutation } from "@tanstack/react-query";

const postAPI = async (data: LoginFormData) => {
  const res = await fetcher("/api/v1/login", { body: data, method: "POST" });
  return res;
};

const useLogin = () => {
  return useMutation<unknown, Error, LoginFormData>({
    mutationFn: (data: LoginFormData) => postAPI(data),
  });
};

export default useLogin;
