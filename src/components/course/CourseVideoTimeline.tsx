"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourse } from "@/hooks/useCourses";
import { ICourseVideo } from "@/models/CourseVideo";
import { formatDuration, estimateVideoDuration, calculateTotalDuration } from "@/lib/videoUtils";
import { getAssetUrl } from "@/lib/assetUtils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  IndianRupee,
  Play,
  Users,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import CustomImage from "../common/CustomImage";
import LoadingError from "../common/LoadingError";
import CourseVideoTimelineSkeleton from "../skeleton/CourseVideoTimeline";
import CourseVideoTimelineItem from "./CourseVideoTimelineItem";

interface CourseVideoTimelineProps {
  courseId: string;
}

const CourseVideoTimeline = ({ courseId }: CourseVideoTimelineProps) => {
  const { data: course, isLoading, error, refetch } = useCourse(courseId);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const router = useRouter();

  // Always call useMemo hook, regardless of data availability
  const videos = useMemo(() => {
    if (!course?.data) return [];
    return (course.data.courseVideos as ICourseVideo[]) || [];
  }, [course?.data]);

  // Calculate total course duration
  const totalDuration = useMemo(() => {
    if (videos.length === 0) return 0;
    // Use actual durations from database if available, otherwise estimate
    const durations = videos.map(video => 
      video.video?.duration || estimateVideoDuration()
    );
    return calculateTotalDuration(durations);
  }, [videos]);

  const handleBackToCourses = () => {
    router.push("/admin/course");
  };

  const handleEditCourse = () => {
    router.push(`/admin/course/${courseId}`);
  };

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  if (!course?.data) {
    return (
      <LoadingError
        isLoading={isLoading}
        error={error?.message}
        errorTitle="Error loading course"
        onRetry={refetch}
        skeleton={<CourseVideoTimelineSkeleton />}
      >
        <div className="text-center py-12">
          <div className="text-muted-foreground">Course not found</div>
          <Button
            onClick={handleBackToCourses}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </LoadingError>
    );
  }

  const courseData = course.data;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleBackToCourses}
          variant="ghost"
          size="sm"
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <Button onClick={handleEditCourse} variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Course
        </Button>
      </div>

      {/* Course Info Card */}
      <Card className="overflow-hidden py-0">
        <div className="grid grid-cols-[1fr_2fr]  gap-3">
          {/* Course Thumbnail */}
          <div className="w-full h-full max-h-50 relative bg-muted">
            <CustomImage
              src={getAssetUrl(courseData.thumbnail)}
              alt={courseData.name}
              className="w-full h-full object-cover"
            />
            {courseData.previewVideo && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center group cursor-pointer">
                <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 text-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Course Details */}
          <div className="flex-1 p-6">
            <CardHeader className="p-0 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold mb-2">
                    {courseData.name}
                  </CardTitle>
                  <p className="text-muted-foreground leading-relaxed">
                    {courseData.description}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-4">
                  {courseData.currency === "dollar" ? (
                    <DollarSign className="h-3 w-3 mr-0.5" />
                  ) : (
                    <IndianRupee className="h-3 w-3 mr-0.5" />
                  )}
                  {courseData.price}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  {videos.length} video{videos.length !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatDuration(totalDuration)}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created {new Date(courseData.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />0 enrolled
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* Video Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="order-2 lg:order-1">
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          {videos.length > 0 ? (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <CourseVideoTimelineItem
                  key={video._id?.toString()}
                  video={video}
                  index={index}
                  isSelected={selectedVideoId === video._id?.toString()}
                  onSelect={() =>
                    handleVideoSelect(video._id?.toString() || "")
                  }
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Videos Yet</h3>
              <p className="text-muted-foreground mb-4">
                This course does not have any videos yet.
              </p>
              <Button onClick={handleEditCourse}>
                <Edit className="h-4 w-4 mr-2" />
                Add Videos
              </Button>
            </Card>
          )}
        </div>

        {/* Video Player */}
        <div className="lg:sticky lg:top-6 lg:h-fit order-1 lg:order-2">
          {selectedVideoId ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Video Player</h2>
              {(() => {
                const selectedVideo = videos.find(
                  (v) => v._id?.toString() === selectedVideoId
                );
                return selectedVideo ? (
                  <Card className="py-0">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden">
                        <video
                          src={getAssetUrl(selectedVideo.video)}
                          poster={getAssetUrl(selectedVideo.thumbnail)}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold mb-2">
                        {selectedVideo.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedVideo.description}
                      </p>
                    </CardContent>
                  </Card>
                ) : null;
              })()}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Video</h3>
              <p className="text-muted-foreground">
                Choose a video from the timeline to start watching
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseVideoTimeline;
