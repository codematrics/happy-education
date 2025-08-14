"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CourseCurrency } from "@/types/constants";
import { CourseFormData, courseValidations } from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import FileUpload from "../common/FileUpload";
import CourseVideoManager from "./CourseVideoManager";

interface CourseFormProps {
  course?: Partial<CourseFormData>;
}

const CourseForm = ({ course }: CourseFormProps) => {
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseValidations),
    defaultValues: {
      name: "",
      description: "",
      thumbnail: "",
      previewVideo: "",
      price: 0,
      currency: CourseCurrency.dollar,
      videos: [],
    },
  });

  const handleSubmit = (values: CourseFormData) => {
    toast.success(
      `Course "${values.name}" has been ${
        course ? "updated" : "created"
      } successfully.`
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col h-full"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {course ? "Edit Course" : "Create New Course"}
              </h1>
            </div>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </div>
          <div className="space-y-6 pb-6">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter course name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price & Currency */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>

                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-28">
                                  <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={CourseCurrency.dollar}>
                                  USD ($)
                                </SelectItem>
                                <SelectItem value={CourseCurrency.rupee}>
                                  INR (₹)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter course description"
                        rows={4}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            {/* MEDIA FILES */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Media Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thumbnail */}
                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        label="Course Thumbnail *"
                        accept="image/*"
                        value={field.value}
                        onChange={(file, url) => field.onChange(url)}
                        placeholder="https://example.com/thumbnail.jpg"
                        type="image"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preview Video */}
                <FormField
                  control={form.control}
                  name="previewVideo"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        label="Preview Video *"
                        accept="video/*"
                        value={field.value}
                        onChange={(file, url) => field.onChange(url)}
                        placeholder="https://example.com/video.mp4"
                        type="video"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            {/* COURSE CONTENT SECTION (Optional for now) */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Course Content</h3>
              {/* Add video list or upload logic here */}
              <CourseVideoManager form={form} />
            </section>
          </div>
          <div className="py-6 border-t mt-auto flex justify-end">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CourseForm;
