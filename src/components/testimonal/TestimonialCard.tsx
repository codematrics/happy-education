import { Course, DropdownProps, Testimonial } from "@/types/types";
import { formatDate } from "@/utils/date";
import { Edit, MoreHorizontal, Trash2, Video } from "lucide-react";
import React from "react";
import CustomDropdown from "../common/CustomDropdown";
import CustomVideo from "../common/CustomVideo";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";

interface Props {
  testimonial: Testimonial;
  onEdit?: (testimonial: Testimonial) => void;
  onDelete?: (testimonialId: string) => void;
  showMoreMenu?: boolean;
}

const TestimonialCard: React.FC<Props> = ({
  testimonial,
  showMoreMenu = false,
  onDelete,
  onEdit,
}) => {
  const testimonialDropdownData: DropdownProps = {
    label: <MoreHorizontal className="h-4 w-4" />,
    options: [
      {
        label: "संपादित करें", // Edit
        action: () => onEdit && onEdit(testimonial),
        icon: Edit,
      },
      {
        label: "हटाएँ", // Delete
        action: () => onDelete && onDelete(testimonial._id),
        icon: Trash2,
        itemClassName: "text-destructive hover:text-destructive",
        iconClassName: "text-destructive",
      },
    ],
  };

  return (
    <Card
      key={testimonial._id}
      className="group hover:shadow-lg transition-all duration-200 border-none shadow-none bg-card p-0 space-0 gap-0 w-full"
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {testimonial.video?.url ? (
            <CustomVideo
              duration={testimonial.video.duration}
              src={testimonial.video.url}
              thumbnail={testimonial?.thumbnail?.url}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {showMoreMenu && (
            <div className="absolute top-3 right-3">
              <CustomDropdown {...testimonialDropdownData} />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-2">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1 items-start">
            {Array.isArray(testimonial.courseId) ? (
              testimonial.courseId.map((course: any, index: number) => (
                <Badge
                  key={course._id || index}
                  variant="secondary"
                  className="text-xs break-words max-w-full whitespace-normal"
                >
                  {course.name || "अज्ञात"} {/* Unknown */}
                </Badge>
              ))
            ) : (
              <Badge
                variant="secondary"
                className="text-xs break-words max-w-full whitespace-normal"
              >
                {(testimonial.courseId as Course)?.name || "अज्ञात"}{" "}
                {/* Unknown */}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-end">
            <span className="text-xs text-muted-foreground">
              {formatDate(testimonial.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
