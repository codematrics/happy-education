"use client";

import CustomVideo from "@/components/common/CustomVideo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import useMyCourseVideos from "@/hooks/useCourseVideo";
import { useCourseProgress, useUpdateVideoProgress } from "@/hooks/useVideoProgress";
import { getAssetUrl } from "@/lib/assetUtils";
import { CourseVideo } from "@/types/types";
import {
  CheckCircle,
  Clock,
  List,
  Play,
  PlayCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CourseVideoLineProps {
  courseId: string;
}

const CourseVideoLine = ({ courseId }: CourseVideoLineProps) => {
  const { data, isLoading, error } = useMyCourseVideos(courseId);
  const course = data?.data;
  const videos = (data?.data?.courseVideos as CourseVideo[]) || [];
  
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [watchTime, setWatchTime] = useState(0);

  const selectedVideo = videos[selectedVideoIndex];
  
  // Fetch course progress from API
  const { data: progressData, isLoading: progressLoading } = useCourseProgress(courseId);
  const updateProgressMutation = useUpdateVideoProgress();

  const courseProgress = progressData?.data?.courseProgress;
  const videoProgresses = progressData?.data?.videoProgresses || [];

  // Get completed video IDs from API
  const completedVideoIds = new Set(
    videoProgresses.filter(p => p.isCompleted).map(p => p.videoId)
  );

  const completionPercentage = courseProgress?.progressPercentage || 0;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVideoComplete = (videoId: string) => {
    const video = videos.find(v => v._id === videoId);
    if (!video) return;

    updateProgressMutation.mutate({
      courseId,
      videoId,
      watchTime: video.video.duration, // Mark as fully watched
      totalDuration: video.video.duration,
      isCompleted: true,
    }, {
      onSuccess: () => {
        toast.success("Video marked as complete!");
      },
      onError: (error) => {
        toast.error("Failed to update progress");
        console.error("Progress update error:", error);
      },
    });
  };

  // Auto-save progress periodically during video playback
  useEffect(() => {
    if (!selectedVideo || watchTime === 0) return;

    const saveProgress = () => {
      updateProgressMutation.mutate({
        courseId,
        videoId: selectedVideo._id,
        watchTime,
        totalDuration: selectedVideo.video.duration,
        isCompleted: watchTime >= selectedVideo.video.duration * 0.9, // Auto-complete at 90%
      });
    };

    // Save progress every 10 seconds
    const interval = setInterval(saveProgress, 10000);
    return () => clearInterval(interval);
  }, [selectedVideo, watchTime, courseId]);

  const handleVideoSelect = (index: number) => {
    setSelectedVideoIndex(index);
  };

  const handleNextVideo = () => {
    if (selectedVideoIndex < videos.length - 1) {
      setSelectedVideoIndex(selectedVideoIndex + 1);
    }
  };

  const handlePreviousVideo = () => {
    if (selectedVideoIndex > 0) {
      setSelectedVideoIndex(selectedVideoIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course videos...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">Unable to load course videos.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No videos available</h2>
          <p className="text-muted-foreground mb-4">This course doesn't have any videos yet.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row relative">
        {/* Main Video Player Area */}
        <div className={`flex-1 p-4 lg:p-6 transition-all duration-300 ${showPlaylist ? 'lg:mr-0' : 'lg:mr-0'}`}>
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
            {selectedVideo && (
              <CustomVideo
                src={getAssetUrl(selectedVideo.video)}
                thumbnail={getAssetUrl(selectedVideo.thumbnail)}
                duration={selectedVideo.video.duration}
                className="w-full h-full"
                onTimeUpdate={(currentTime) => setWatchTime(currentTime)}
              />
            )}
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {selectedVideo?.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedVideo && formatDuration(selectedVideo.video.duration)}
                </span>
                <span>Video {selectedVideoIndex + 1} of {videos.length}</span>
              </div>
            </div>

            {/* Course Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Course Progress</h3>
                  <span className="text-sm text-muted-foreground">
                    {courseProgress?.completedVideos || 0} of {courseProgress?.totalVideos || videos.length} completed
                  </span>
                </div>
                <Progress value={completionPercentage} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {Math.round(completionPercentage)}% complete
                </p>
              </CardContent>
            </Card>

            {/* Video Description */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">About this video</h3>
                <p className="text-muted-foreground">
                  {selectedVideo?.description}
                </p>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePreviousVideo}
                disabled={selectedVideoIndex === 0}
                className="flex-1"
              >
                Previous Video
              </Button>
              <Button
                onClick={() => handleVideoComplete(selectedVideo?._id || '')}
                disabled={completedVideoIds.has(selectedVideo?._id || '') || updateProgressMutation.isPending}
                className="flex-1"
              >
                {completedVideoIds.has(selectedVideo?._id || '') ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : updateProgressMutation.isPending ? (
                  'Updating...'
                ) : (
                  'Mark as Complete'
                )}
              </Button>
              <Button
                onClick={handleNextVideo}
                disabled={selectedVideoIndex === videos.length - 1}
                className="flex-1"
              >
                Next Video
              </Button>
            </div>
          </div>
        </div>

        {/* Video Playlist Sidebar */}
        <div className={`
          ${showPlaylist ? 'block' : 'hidden lg:block'} 
          w-full lg:w-96 bg-card border-l 
          fixed lg:relative inset-y-0 right-0 z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${showPlaylist ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold flex items-center gap-2">
                <List className="h-5 w-5" />
                Course Content
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="lg:hidden"
              >
                {showPlaylist ? 'Hide' : 'Show'}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {course.name}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {videos.map((video, index) => {
              const isSelected = index === selectedVideoIndex;
              const isCompleted = completedVideoIds.has(video._id);

              return (
                <div key={video._id}>
                  <button
                    onClick={() => handleVideoSelect(index)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      isSelected ? 'bg-primary/10 border-r-2 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Video Thumbnail */}
                      <div className="relative w-20 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        {video.thumbnail && (
                          <img
                            src={getAssetUrl(video.thumbnail)}
                            alt={video.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Status Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : isSelected ? (
                            <Play className="h-4 w-4 text-primary" />
                          ) : (
                            <PlayCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Duration */}
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                          {formatDuration(video.video.duration)}
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {index + 1}
                          </span>
                          {isCompleted && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                        <h4 className={`font-medium text-sm line-clamp-2 mb-1 ${
                          isSelected ? 'text-primary' : ''
                        }`}>
                          {video.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                    </div>
                  </button>
                  {index < videos.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {showPlaylist && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowPlaylist(false)}
        />
      )}

      {/* Mobile Toggle Button for Playlist */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPlaylist(!showPlaylist)}
        className="fixed bottom-4 right-4 lg:hidden z-50 shadow-lg"
      >
        <List className="h-4 w-4 mr-2" />
        {showPlaylist ? 'Hide' : 'Show'} Playlist
      </Button>
    </div>
  );
};

export default CourseVideoLine;
