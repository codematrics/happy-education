import { ICourse } from "@/models/Course";
import { HTMLProps } from "react";

export interface ResponseInterface<T> {
  data: T;
  message: string;
  status: boolean;
}

export interface Course extends ICourse {
  _id: string;
}

export interface DropdownProps {
  label: string | React.ReactNode;
  options: {
    label: string;
    icon?: React.ElementType;
    action: () => void;
    itemClassName?: HTMLProps<HTMLElement>["className"];
    iconClassName?: HTMLProps<HTMLElement>["className"];
  }[];
}
