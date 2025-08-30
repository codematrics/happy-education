"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAssetUrl } from "@/lib/assetUtils";
import { estimateVideoDuration, formatDuration } from "@/lib/videoUtils";
import { ICourseVideo } from "@/models/CourseVideo";
import { CheckCircle, Clock, Play } from "lucide-react";
import { useEffect, useState } from "react";
import CustomImage from "../common/CustomImage";

interface CourseVideoTimelineItemProps {
  video: ICourseVideo;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

const CourseVideoTimelineItem = ({
  video,
  index,
  isSelected,
  onSelect,
}: CourseVideoTimelineItemProps) => {
  const [isWatched, setIsWatched] = useState(false);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    if (video.video?.duration) {
      setDuration(video.video.duration);
    } else {
      const estimatedDurationSeconds = estimateVideoDuration();
      setDuration(estimatedDurationSeconds);
    }
  }, [video.video]);

  const handleClick = () => {
    onSelect();
    setIsWatched(true);
  };

  return (
    <div className="relative">
      {index > 0 && (
        <div className="absolute left-6 -top-4 w-0.5 h-4 bg-border" />
      )}

      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected
            ? "ring-2 ring-primary border-primary shadow-md"
            : "hover:border-primary/50"
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Timeline dot and thumbnail */}
            <div className="relative flex-shrink-0">
              <div
                className={`absolute -left-2 top-3 w-4 h-4 rounded-full border-2 border-background z-10 ${
                  isWatched
                    ? "bg-green-500"
                    : isSelected
                    ? "bg-primary"
                    : "bg-muted border-border"
                }`}
              >
                {isWatched && (
                  <CheckCircle className="w-3 h-3 text-background absolute inset-0.5" />
                )}
              </div>

              <div className="w-20 h-12 rounded-lg overflow-hidden bg-muted relative group">
                <CustomImage
                  src={getAssetUrl(video.thumbnail)}
                  alt={video.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Video details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3
                  className={`font-medium text-sm leading-tight line-clamp-2 ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {index + 1}. {video.name}
                </h3>
                <Badge
                  variant={isSelected ? "default" : "secondary"}
                  className="text-xs ml-2"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(duration)}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {video.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isWatched && (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    देखा गया
                  </span>
                )}
                {isSelected && !isWatched && (
                  <>
                    <span>•</span>
                    <span className="text-primary">अब चल रहा है</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseVideoTimelineItem;
