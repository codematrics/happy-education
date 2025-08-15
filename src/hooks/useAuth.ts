"use client";

import { fetcher } from "@/lib/fetch";
import {
  ForgotPasswordFormData,
  LoginAdminFormData,
  LoginUserFormData,
  NewPasswordFormData,
  OtpFormData,
  SignUpUserFormData,
} from "@/types/schema";
import { useMutation } from "@tanstack/react-query";

const postAdminAPI = async (data: LoginAdminFormData) => {
  const res = await fetcher("/api/v1/admin/login", {
    body: data,
    method: "POST",
  });
  return res;
};

const postUserAPI = async (data: LoginUserFormData) => {
  const res = await fetcher("/api/v1/user/login", {
    body: data,
    method: "POST",
  });
  return res;
};

const postUserSignupAPI = async (data: SignUpUserFormData) => {
  const res = await fetcher("/api/v1/user/signup", {
    body: data,
    method: "POST",
  });
  return res;
};

const postUserVerifyOtpAPI = async (data: OtpFormData) => {
  const res = await fetcher("/api/v1/user/verify-otp", {
    body: data,
    method: "POST",
  });
  return res;
};

const postUserResendOtpAPI = async () => {
  const res = await fetcher("/api/v1/user/resend-otp", {
    method: "POST",
  });
  return res;
};

const postUserForgotPasswordAPI = async (data: ForgotPasswordFormData) => {
  const res = await fetcher("/api/v1/user/forgot-password", {
    body: data,
    method: "POST",
  });
  return res;
};

const postUserNewPasswordAPI = async (data: NewPasswordFormData) => {
  const res = await fetcher("/api/v1/user/new-password", {
    body: data,
    method: "POST",
  });
  return res;
};

export const useAdminLogin = () => {
  return useMutation<unknown, Error, LoginAdminFormData>({
    mutationFn: (data: LoginAdminFormData) => postAdminAPI(data),
  });
};

export const useLogin = () => {
  return useMutation<unknown, Error, LoginUserFormData>({
    mutationFn: (data: LoginUserFormData) => postUserAPI(data),
  });
};

export const useVerifyOtp = () => {
  return useMutation<unknown, Error, OtpFormData>({
    mutationFn: (data: OtpFormData) => postUserVerifyOtpAPI(data),
  });
};

export const useForgotPassword = () => {
  return useMutation<unknown, Error, ForgotPasswordFormData>({
    mutationFn: (data: ForgotPasswordFormData) =>
      postUserForgotPasswordAPI(data),
  });
};

export const useNewPassword = () => {
  return useMutation<unknown, Error, NewPasswordFormData>({
    mutationFn: (data: NewPasswordFormData) => postUserNewPasswordAPI(data),
  });
};

export const useResendOtp = () => {
  return useMutation<unknown, Error, null>({
    mutationFn: () => postUserResendOtpAPI(),
  });
};

export const useSignup = () => {
  return useMutation<unknown, Error, SignUpUserFormData>({
    mutationFn: (data: SignUpUserFormData) => postUserSignupAPI(data),
  });
};

export default useAdminLogin;
