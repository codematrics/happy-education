"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getAssetUrl } from "@/lib/assetUtils";
import { Course, DropdownProps } from "@/types/types";
import {
  CheckCircle,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  Video,
} from "lucide-react";
import Link from "next/link";
import CustomDropdown from "../common/CustomDropdown";
import CustomImage from "../common/CustomImage";

interface CourseCardProps {
  course: Course;
  onEdit?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
  onViewVideos?: (courseId: string) => void;
  showMore?: boolean;
  onBuy?: (courseId: string) => void;
  showBuy?: boolean;
  showBenefits?: boolean;
}

const CourseCard = ({
  course,
  onEdit,
  onDelete,
  onViewVideos,
  onBuy,
  showBuy = true,
  showMore = false,
  showBenefits = true,
}: CourseCardProps) => {
  const courseDropdownData: DropdownProps = {
    label: <MoreHorizontal className="h-4 w-4" />,
    options: [
      {
        label: "Edit",
        action: () => onEdit && onEdit(course._id),
        icon: Edit,
      },
      {
        label: "View Videos",
        action: () => onViewVideos && onViewVideos(course._id),
        icon: Eye,
      },
      {
        label: "Delete",
        action: () => onDelete && onDelete(course._id),
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
    <Card className="group h-full py-0 hover:shadow-lg transition-all duration-200 border-border bg-card gap-4 w-full">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {course.thumbnail ? (
            <CustomImage
              src={getAssetUrl(course.thumbnail)}
              alt={course.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {showMore && (
            <div className="absolute top-3 right-3">
              <CustomDropdown {...courseDropdownData} />
            </div>
          )}
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

          {/* Benefits Section */}
          {course.benefits && showBenefits && course.benefits.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground">
                Key Benefits:
              </h4>
              <div className="space-y-1">
                {course.benefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {benefit}
                    </span>
                  </div>
                ))}
                {course.benefits.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{course.benefits.length - 3} more benefits
                  </div>
                )}
              </div>
            </div>
          )}

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

      <CardFooter className="p-4 pt-0 justify-self-end">
        <div className="flex items-center justify-between w-full gap-2">
          <span className="text-xl font-bold text-primary">
            {formatPrice(course.price, course.currency)}
          </span>
          <div className="flex items-center gap-2">
            {showBuy && onBuy && (
              <Button
                asChild
                variant="outline"
                size="sm"
                onClick={() => onBuy(course._id)}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Link href={`/course/${course._id}`}>View Details</Link>
              </Button>
            )}
            {showBuy && onBuy && (
              <Button
                size="sm"
                onClick={() => onBuy(course._id)}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Buy Course
              </Button>
            )}
            {showMore && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(course._id)}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Edit Course
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
