import { CourseFormData } from "@/types/schema";
import { Course, ResponseInterface } from "@/types/types";
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
  return fetcher(`/api/v1/course?page=${page}&limit=${limit}&search=${search}`);
};

export const getCourseById = (
  id?: string
): Promise<ResponseInterface<Course>> => {
  return fetcher(`/api/v1/course/${id}`);
};
