import { ICourse } from "@/models/Course";
import { ICourseVideo } from "@/models/CourseVideo";
import { IInquiry } from "@/models/Inquiry";
import { ITestimonial } from "@/models/Testimonial";
import { IUser } from "@/models/User";
import { HTMLProps } from "react";

export interface ResponseInterface<T> {
  data: T;
  message: string;
  status: boolean;
}

export interface Course extends ICourse {
  _id: string;
  testimonials?: Testimonial[];
  relatedCourse?: Course[];
  isPurchased?: boolean;
}

export interface User extends IUser {
  _id: string;
}

export interface Admin {
  userName: string;
}

export interface Inquiry extends IInquiry {
  _id: string;
}

export interface Testimonial extends ITestimonial {
  _id: string;
  courseName?: string[];
  courseIds?: string[];
}

export interface CourseVideo extends ICourseVideo {
  _id: string;
}

export interface DropdownProps<T = any> {
  label: string | React.ReactNode;
  data?: T;
  options: {
    label: string;
    icon?: React.ElementType;
    action: (data?: T) => void;
    itemClassName?: HTMLProps<HTMLElement>["className"];
    iconClassName?: HTMLProps<HTMLElement>["className"];
  }[];
}

