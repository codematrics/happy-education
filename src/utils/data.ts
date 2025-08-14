import { BookCopy, BookOpen, Calendar, Home } from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
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
