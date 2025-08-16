"use client";

import { BookCopy, BookOpen, Calendar, Home, User } from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: User,
  },
  {
    title: "Courses",
    url: "/admin/course",
    icon: BookOpen,
  },
  {
    title: "Events",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Testimonials",
    url: "#",
    icon: BookCopy,
  },
];

export const getSortParams = (sortValue: string) => {
  switch (sortValue) {
    case "newest":
      return { sortBy: "createdAt", sortOrder: "desc" as const };
    case "oldest":
      return { sortBy: "createdAt", sortOrder: "asc" as const };
    case "name":
      return { sortBy: "name", sortOrder: "asc" as const };
    case "price-low":
      return { sortBy: "price", sortOrder: "asc" as const };
    case "price-high":
      return { sortBy: "price", sortOrder: "desc" as const };
    default:
      return { sortBy: "createdAt", sortOrder: "desc" as const };
  }
};
