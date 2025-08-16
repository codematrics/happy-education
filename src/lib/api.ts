import { CourseFormData } from "@/types/schema";
import { Course, ResponseInterface, Testimonial, User } from "@/types/types";
import { fetcher } from "./fetch";
import { PaginationResult } from "./pagination";

export const getCourses = (
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<
  ResponseInterface<{
    items: Course[];
    pagination: PaginationResult<CourseFormData>["pagination"];
  }>
> => {
  return fetcher(
    `/api/v1/admin/course?page=${page}&limit=${limit}&search=${search}`
  );
};

export const getTestimonial = (
  page: number = 1,
  limit: number = 10
): Promise<
  ResponseInterface<{
    items: Testimonial[];
    pagination: PaginationResult<CourseFormData>["pagination"];
  }>
> => {
  return fetcher(`/api/v1/admin/testimonial?page=${page}&limit=${limit}`);
};

export const getUsers = (
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<
  ResponseInterface<{
    items: User[];
    pagination: PaginationResult<User>["pagination"];
  }>
> => {
  return fetcher(
    `/api/v1/admin/users?page=${page}&limit=${limit}&search=${search}`
  );
};

export const getCourseById = (
  id?: string
): Promise<ResponseInterface<Course>> => {
  return fetcher(`/api/v1/admin/course/${id}`);
};
