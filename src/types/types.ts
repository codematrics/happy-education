import { ICourse } from "@/models/Course";
import { IUser } from "@/models/User";
import { HTMLProps } from "react";

export interface ResponseInterface<T> {
  data: T;
  message: string;
  status: boolean;
}

export interface Course extends ICourse {
  _id: string;
}

export interface User extends IUser {
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
