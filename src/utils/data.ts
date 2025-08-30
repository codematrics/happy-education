"use client";

import {
  BadgeIndianRupee,
  BookCopy,
  BookOpen,
  Calendar,
  Home,
  User,
  UserRoundSearch,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    url: "/admin",
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
    url: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Testimonials",
    url: "/admin/testimonial",
    icon: BookCopy,
  },
  {
    title: "Inquiry",
    url: "/admin/inquiries",
    icon: UserRoundSearch,
  },
  {
    title: "Revenue",
    url: "/admin/revenue",
    icon: BadgeIndianRupee,
  },
];

export const navbarItems = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Courses",
    url: "/courses",
  },
  {
    title: "Testimonials",
    url: "/testimonials",
  },
  // {
  //   title: "Events",
  //   url: "#",
  //   icon: Calendar,
  // },
  {
    title: "Contact",
    url: "/contact",
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
