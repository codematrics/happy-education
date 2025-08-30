import { CourseFormData } from "@/types/schema";
import {
  Course,
  Event,
  Inquiry,
  ResponseInterface,
  Testimonial,
  User,
} from "@/types/types";
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

export const getMyCourses = (
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
    `/api/v1/my-courses?page=${page}&limit=${limit}&search=${search}`
  );
};

export const getAdminRevenue = (
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  return fetcher(
    `/api/v1/revenue?page=${page}&limit=${limit}&search=${search}`
  );
};

export const getMyVideos = (
  courseId: string
): Promise<ResponseInterface<Course>> => {
  return fetcher(`/api/v1/videos/${courseId}`);
};

export const getCourseProgress = (
  courseId: string
): Promise<ResponseInterface<Course>> => {
  return fetcher(`/api/v1/video-progress?courseId=${courseId}`);
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
  return fetcher(`/api/v1/testimonial?page=${page}&limit=${limit}`);
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
  return fetcher(`/api/v1/users?page=${page}&limit=${limit}&search=${search}`);
};

export const getCourseById = (
  id?: string,
  relatedCourse?: string
): Promise<ResponseInterface<Course>> => {
  const query = relatedCourse ? "" : `?relatedCourse=${relatedCourse}`;
  return fetcher(`/api/v1/course/${id}${query}`);
};

export const getInquiry = (
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<
  ResponseInterface<{
    items: Inquiry[];
    pagination: PaginationResult<Inquiry>["pagination"];
  }>
> => {
  return fetcher(
    `/api/v1/inquiry?page=${page}&limit=${limit}&search=${search}`
  );
};

export const getEvents = (): Promise<ResponseInterface<Event[]>> => {
  return fetcher(`/api/v1/events`);
};
