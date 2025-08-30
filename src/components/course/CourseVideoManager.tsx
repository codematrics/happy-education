"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Toast } from "@/lib/toast";
import { CourseFormData, CourseUpdateData } from "@/types/schema";
import { GripVertical, Plus, Trash2, Video } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { FormFileUpload } from "../common/FileUpload";
import { FormInput } from "../common/FormInput";
import { FormTextarea } from "../common/FormTextArea";

interface CourseVideoManagerProps {
  form: UseFormReturn<CourseFormData | CourseUpdateData>;
}

const CourseVideoManager = ({ form }: CourseVideoManagerProps) => {
  const { control, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "courseVideos",
  });

  const handleAddVideo = () => {
    append({
      name: "",
      description: "",
      thumbnail: {
        publicId: "",
        url: "",
      },
      video: {
        publicId: "",
        format: "",
        width: 0,
        height: 0,
        url: "",
        duration: 0,
      },
    });
  };

  const handleDeleteVideo = (index: number) => {
    const videoName = fields[index]?.name || "";
    remove(index);
    Toast.success(`"${videoName}" वीडियो को कोर्स से हटा दिया गया है।`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">कोर्स वीडियो</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddVideo}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          वीडियो जोड़ें
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            अभी तक कोई वीडियो नहीं जोड़ा गया है
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddVideo}
            className="mt-2"
          >
            पहला वीडियो जोड़ें
          </Button>
        </div>
      )}

      {fields.map((field, index) => (
        <Card key={field.id} className="border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">#{index + 1}</span>
                <CardTitle className="text-sm font-medium">
                  {getValues(`courseVideos.${index}.name`) ||
                    "नाम नहीं दिया गया"}
                </CardTitle>
              </div>
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
          </CardHeader>

          <CardContent className="space-y-4">
            <FormInput
              control={control}
              name={`courseVideos.${index}.name`}
              label="वीडियो का नाम *"
              placeholder="वीडियो का नाम दर्ज करें"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormFileUpload
                name={`courseVideos.${index}.thumbnail`}
                label="वीडियो थंबनेल *"
                accept=".jpg,.jpeg,.png,.webp"
                type="image"
                control={form.control}
                folder="course-video-thumbnails"
              />

              <FormFileUpload
                name={`courseVideos.${index}.video`}
                label="वीडियो फ़ाइल *"
                accept=".mp4,.avi,.mov,.mkv"
                type="video"
                control={form.control}
                folder="course-videos"
              />
            </div>

            <FormTextarea
              control={control}
              name={`courseVideos.${index}.description`}
              label="विवरण *"
              placeholder="वीडियो का विवरण दर्ज करें"
              rows={2}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CourseVideoManager;
