"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast } from "@/lib/toast";
import {
  CourseFormData,
  CourseUpdateData,
  CourseVideoFormData,
  courseVideoValidation,
} from "@/types/schema";
import { Edit, GripVertical, Plus, Save, Trash2, Video, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import CustomImage from "../common/CustomImage";
import CustomVideo from "../common/CustomVideo";
import FileUpload from "../common/FileUpload";
import { Textarea } from "../ui/textarea";

interface CourseVideoManagerProps {
  form: UseFormReturn<CourseFormData | CourseUpdateData>;
}

const CourseVideoManager = ({ form }: CourseVideoManagerProps) => {
  const { control } = form;
  const { fields, update, append, remove } = useFieldArray({
    control,
    name: "courseVideos",
  });

  const [newVideo, setNewVideo] = useState<CourseVideoFormData>({
    name: "",
    description: "",
    thumbnail: "",
    video: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingVideo, setEditingVideo] = useState<CourseVideoFormData>({
    name: "",
    description: "",
    thumbnail: "",
    video: "",
  });

  const handleAddVideo = () => {
    const parsed = courseVideoValidation.safeParse(newVideo);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message;
      if (firstError) {
        Toast.error(firstError);
      }
      return;
    }

    append(newVideo);
    setNewVideo({ name: "", description: "", thumbnail: "", video: "" });
    setIsAdding(false);
  };

  const handleEditVideo = (index: number) => {
    const video = form.getValues(`courseVideos.${index}`);
    setEditingVideo(video);
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const parsed = courseVideoValidation.safeParse(editingVideo);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message;
      if (firstError) {
        Toast.error(firstError);
      }
      return;
    }

    update(editingIndex, editingVideo);
    setEditingIndex(null);
    setEditingVideo({ name: "", description: "", thumbnail: "", video: "" });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingVideo({ name: "", description: "", thumbnail: "", video: "" });
  };

  const handleDeleteVideo = (index: number) => {
    const videoName = fields[index]?.name || "";
    remove(index);
    Toast.success(`"${videoName}" has been removed from the course.`);
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

      {fields && fields.length > 0 && (
        <div className="space-y-3">
          {fields?.map((field, index) => {
            if (editingIndex === index) {
              return (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-sm">Edit Video</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editVideoName" className="text-sm">
                        Video Name *
                      </Label>
                      <Input
                        id="editVideoName"
                        value={editingVideo.name}
                        onChange={(e) =>
                          setEditingVideo((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter video name"
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FileUpload
                        label="Video File *"
                        accept=".mp4,.avi,.mov,.wmv,.flv,.webm"
                        type="video"
                        placeholder="https://example.com/video.mp4"
                        onChange={(file, url) =>
                          setEditingVideo((prev) => ({
                            ...prev,
                            video: file || "",
                          }))
                        }
                        value={editingVideo.video}
                      />
                      <FileUpload
                        label="Video Thumbnail"
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                        type="image"
                        placeholder="https://example.com/thumbnail.jpg"
                        onChange={(file, url) =>
                          setEditingVideo((prev) => ({
                            ...prev,
                            thumbnail: file || "",
                          }))
                        }
                        value={editingVideo.thumbnail}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editVideoDescription" className="text-sm">
                        Description
                      </Label>
                      <Textarea
                        id="editVideoDescription"
                        value={editingVideo.description}
                        onChange={(e) =>
                          setEditingVideo((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter video description"
                        className="min-h-16 resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveEdit}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={field.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-muted-foreground">
                        <GripVertical className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium">
                          {field.name}
                        </CardTitle>
                        {field.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {field.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVideo(index)}
                        className="h-6 w-6 p-0 hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
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

                {field.thumbnail && (
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <CustomImage
                          src={field.thumbnail}
                          alt={field.name}
                          className="w-16 h-10 object-cover rounded border"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                          <Video className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="relative">
                        <CustomVideo
                          src={field.video}
                          className="w-16 h-10 object-cover rounded border"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                          <Video className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {isAdding && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Add New Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="Video File *"
                accept=".mp4,.avi,.mov,.wmv,.flv,.webm"
                type="video"
                placeholder="https://example.com/video.mp4"
                onChange={(file, url) =>
                  setNewVideo((prev) => ({ ...prev, video: file || "" }))
                }
                value={newVideo.video}
              />
              <FileUpload
                label="Video Thumbnail"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                type="image"
                placeholder="https://example.com/thumbnail.jpg"
                onChange={(file, url) =>
                  setNewVideo((prev) => ({ ...prev, thumbnail: file || "" }))
                }
                value={newVideo.thumbnail}
              />
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

      {fields && fields.length === 0 && !isAdding && (
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
