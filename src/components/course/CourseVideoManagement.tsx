import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/lib/toast";
import { getAssetUrl } from "@/lib/assetUtils";
import { ICourseVideo } from "@/models/CourseVideo";
import { GripVertical, Plus, Trash2, Video } from "lucide-react";
import { useState } from "react";
import CustomImage from "../common/CustomImage";
import FileUpload from "../common/FileUpload";

interface CourseVideoFormData {
  name: string;
  description: string;
  thumbnail: string;
  video: string;
}

interface CourseVideoManagerProps {
  videos: any[];
  onChange: (videos: any[]) => void;
}

const CourseVideoManager = ({ videos, onChange }: CourseVideoManagerProps) => {
  const [newVideo, setNewVideo] = useState<CourseVideoFormData>({
    name: "",
    description: "",
    thumbnail: "",
    video: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddVideo = () => {
    if (!newVideo.name || !newVideo.video) {
      Toast.error("Please provide video name and video file");
      return;
    }

    const video = {
      _id: Date.now().toString(),
      ...newVideo,
      createdAt: new Date(),
    };

    onChange([...videos, video]);
    setNewVideo({ name: "", description: "", thumbnail: "", video: "" });
    setIsAdding(false);

    Toast.success(`"${newVideo.name}" has been added to the course.`);
  };

  const handleUpdateVideo = (
    index: number,
    updatedVideo: any
  ) => {
    const updatedVideos = videos.map((video, i) =>
      i === index ? { ...video, ...updatedVideo } : video
    );
    onChange(updatedVideos);
    setEditingIndex(null);

    Toast.success("Video has been updated successfully.");
  };

  const handleDeleteVideo = (index: number) => {
    const videoName = videos[index].name;
    const updatedVideos = videos.filter((_, i) => i !== index);
    onChange(updatedVideos);

    Toast.success(`"${videoName}" has been removed from the course.`);
  };

  const handleFileUpload =
    (field: keyof CourseVideoFormData) => (file: File | null, url?: string) => {
      if (url) {
        setNewVideo((prev) => ({ ...prev, [field]: url }));
      }
    };

  const formatDuration = (index: number) => {
    // Mock duration for display
    return `${Math.floor(Math.random() * 30) + 5}:${Math.floor(
      Math.random() * 60
    )
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Course Videos</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Video
        </Button>
      </div>

      {/* Existing Videos */}
      {videos.length > 0 && (
        <div className="space-y-3">
          {videos.map((video, index) => (
            <Card key={video._id?.toString() || index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-muted-foreground">
                      <GripVertical className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium">
                        {video.name}
                      </CardTitle>
                      {video.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {formatDuration(index)}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVideo(index)}
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {video.thumbnail && (
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <CustomImage
                        src={getAssetUrl(video.thumbnail)}
                        alt={video.name}
                        className="w-16 h-10 object-cover rounded border"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                        <Video className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate flex-1">
                      {getAssetUrl(video.video) || 'No video file'}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add New Video Form */}
      {isAdding && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Add New Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="videoName" className="text-sm">
                  Video Name *
                </Label>
                <Input
                  id="videoName"
                  value={newVideo.name}
                  onChange={(e) =>
                    setNewVideo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter video name"
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Video File *</Label>
                <FileUpload
                  label=""
                  accept=".mp4,.avi,.mov,.wmv,.flv,.webm"
                  type="video"
                  placeholder="https://example.com/video.mp4"
                  onChange={handleFileUpload("video")}
                  value={newVideo.video}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoDescription" className="text-sm">
                Description
              </Label>
              <Textarea
                id="videoDescription"
                value={newVideo.description}
                onChange={(e) =>
                  setNewVideo((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter video description"
                className="min-h-16 resize-none"
                rows={2}
              />
            </div>

            <FileUpload
              label="Video Thumbnail"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              type="image"
              placeholder="https://example.com/thumbnail.jpg"
              onChange={handleFileUpload("thumbnail")}
              value={newVideo.thumbnail}
            />

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewVideo({
                    name: "",
                    description: "",
                    thumbnail: "",
                    video: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddVideo}
                className="bg-primary hover:bg-primary/90"
              >
                Add Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {videos.length === 0 && !isAdding && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No videos added yet</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="mt-2"
          >
            Add First Video
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseVideoManager;
