"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Course, DropdownProps } from "@/types/types";
import { Edit, Eye, MoreHorizontal, Trash2, Video } from "lucide-react";
import CustomDropdown from "../common/CustomDropdown";
import CustomImage from "../common/CustomImage";

interface CourseCardProps {
  course: Course;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
  onViewVideos: (courseId: string) => void;
}

const CourseCard = ({
  course,
  onEdit,
  onDelete,
  onViewVideos,
}: CourseCardProps) => {
  const courseDropdownData: DropdownProps = {
    label: <MoreHorizontal className="h-4 w-4" />,
    options: [
      {
        label: "Edit",
        action: () => onEdit(course._id),
        icon: Edit,
      },
      {
        label: "View Videos",
        action: () => onViewVideos(course._id),
        icon: Eye,
      },
      {
        label: "Delete",
        action: () => onDelete(course._id),
        icon: Trash2,
        itemClassName: "text-destructive hover:text-destructive",
        iconClassName: "text-destructive",
      },
    ],
  };

  const formatPrice = (price: number, currency: "dollar" | "rupee") => {
    const symbol = currency === "dollar" ? "$" : "₹";
    return `${symbol}${price.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getVideoCount = () => {
    if (!course.courseVideos) return 0;
    return Array.isArray(course.courseVideos) ? course.courseVideos.length : 0;
  };

  return (
    <Card className="group py-0 hover:shadow-lg transition-all duration-200 border-border bg-card gap-4">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {course.thumbnail ? (
            <CustomImage
              src={course.thumbnail}
              alt={course.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <CustomDropdown {...courseDropdownData} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-card-foreground line-clamp-1">
              {course.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {course.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {getVideoCount()} videos
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(course.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-xl font-bold text-primary">
            {formatPrice(course.price, course.currency)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(course._id)}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Edit Course
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
