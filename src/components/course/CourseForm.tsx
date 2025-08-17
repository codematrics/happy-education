"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
} from "@/hooks/useCourses";
import { CourseCurrency, currencyOptions } from "@/types/constants";
import {
  CourseFormData,
  CourseUpdateData,
  courseUpdateValidations,
  courseValidations,
} from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import BenefitsManager from "../common/BenefitsManager";
import { FormFileUpload } from "../common/FileUpload";
import { FormSelect } from "../common/FormDropdown";
import { FormInput } from "../common/FormInput";
import FormSpinner from "../common/FormSpinner";
import { FormTextarea } from "../common/FormTextArea";
import CourseVideoManager from "./CourseVideoManager";

interface CourseFormProps {
  courseId?: string;
}

const defaultValues: CourseFormData = {
  name: "",
  description: "",
  benefits: [],
  thumbnail: {
    publicId: "",
    url: "",
  },
  previewVideo: {
    publicId: "",
    format: "",
    width: 0,
    height: 0,
    url: "",
    duration: 0,
  },
  price: 0,
  currency: CourseCurrency.dollar,
  courseVideos: [],
};

const CourseForm = ({ courseId }: CourseFormProps) => {
  const { mutateAsync: createCourse, isPending: isCreating } =
    useCreateCourse();
  const { mutateAsync: updateCourse, isPending: isUpdating } =
    useUpdateCourse();
  const { data: course, isLoading } = useCourse({ courseId });
  const router = useRouter();

  const form = useForm<CourseFormData | CourseUpdateData>({
    resolver: zodResolver(
      course?.data ? courseUpdateValidations : courseValidations
    ),
    defaultValues: course?.data
      ? (course.data as CourseFormData)
      : defaultValues,
  });

  const handleSubmit = async (values: CourseFormData | CourseUpdateData) => {
    if (courseId) {
      await updateCourse({ courseId, data: values as CourseUpdateData });
    } else {
      await createCourse(values as CourseFormData);
    }
    router.push("/admin/courses");
  };

  useEffect(() => {
    if (course?.data) {
      form.reset(course.data as CourseFormData);
    }
  }, [course, form]);

  if (isLoading) {
    return <FormSpinner />;
  }

  console.log(form.getValues(), form.formState.errors);

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
                {courseId ? "Edit Course" : "Create New Course"}
              </h1>
            </div>
            <Button
              disabled={
                !form.formState.isDirty ||
                form.formState.isSubmitting ||
                isCreating ||
                isUpdating
              }
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCreating
                ? "Creating..."
                : isUpdating
                ? "Updating..."
                : courseId
                ? "Update Course"
                : "Create Course"}
            </Button>
          </div>
          <div className="space-y-6 pb-6">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name="name"
                  control={form.control}
                  label="Course Name *"
                  placeholder="course name"
                />

                <div className="grid grid-cols-2 items-end gap-4">
                  <FormInput
                    label="Price *"
                    name="price"
                    type="number"
                    control={form.control}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />

                  <FormSelect
                    name="currency"
                    control={form.control}
                    options={currencyOptions}
                  />
                </div>
              </div>

              <FormTextarea
                name="description"
                label="Description *"
                control={form.control}
              />

              <BenefitsManager form={form} />
            </section>
            <Separator />

            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Media Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormFileUpload
                  name="thumbnail"
                  label="Course Thumbnail *"
                  accept="image/*"
                  control={form.control}
                  type="image"
                  folder="course-thumbnails"
                />

                <FormFileUpload
                  name="previewVideo"
                  label="Preview Video"
                  accept="video/*"
                  control={form.control}
                  type="video"
                  folder="course-preview-videos"
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Course Content</h3>
              <CourseVideoManager form={form} />
            </section>
          </div>
          <div className="py-6 border-t mt-auto flex justify-end">
            <Button
              disabled={
                !form.formState.isDirty ||
                form.formState.isSubmitting ||
                isCreating ||
                isUpdating
              }
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCreating ? (
                "Creating..."
              ) : isUpdating ? (
                "Updating..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {courseId ? "Update" : "Create"} Course
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CourseForm;
