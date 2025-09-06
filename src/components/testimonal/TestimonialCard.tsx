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
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

const TestimonialCard: React.FC<Props> = ({
  testimonial,
  showMoreMenu = false,
  onDelete,
  onEdit,
  isPlaying,
  onPlay,
  onPause,
}) => {
  const testimonialDropdownData: DropdownProps = {
    label: <MoreHorizontal className="h-4 w-4" />,
    options: [
      {
        label: "संपादित करें",
        action: () => onEdit && onEdit(testimonial),
        icon: Edit,
      },
      {
        label: "हटाएँ",
        action: () => onDelete && onDelete(testimonial._id),
        icon: Trash2,
        itemClassName: "text-destructive hover:text-destructive",
        iconClassName: "text-destructive",
      },
    ],
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-none shadow-none bg-card p-0 w-full">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {testimonial.video?.url ? (
            <CustomVideo
              duration={testimonial.video.duration}
              src={testimonial.video.url}
              thumbnail={testimonial?.thumbnail?.url}
              className="w-full h-70 md:h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              isPlaying={isPlaying}
              onPlay={onPlay}
              onPause={onPause}
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
                  {course.name || "अज्ञात"}
                </Badge>
              ))
            ) : (
              <Badge
                variant="secondary"
                className="text-xs break-words max-w-full whitespace-normal"
              >
                {(testimonial.courseId as Course)?.name || "अज्ञात"}
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
