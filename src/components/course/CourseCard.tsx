import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CourseFormData } from "@/types/schema";
import { Edit, Eye, MoreHorizontal, Trash2, Video } from "lucide-react";

interface CourseCardProps {
  course: CourseFormData;
  onEdit: (course: CourseFormData) => void;
  onDelete: (courseId: string) => void;
  onViewVideos: (courseId: string) => void;
}

const CourseCard = ({
  course,
  onEdit,
  onDelete,
  onViewVideos,
}: CourseCardProps) => {
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
    <Card className="group hover:shadow-lg transition-all duration-200 border-border bg-card">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {course.thumbnail ? (
            <img
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(course)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewVideos(course.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Videos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(course.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
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
            onClick={() => onEdit(course)}
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
