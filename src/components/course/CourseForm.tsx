"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
} from "@/hooks/useCourses";
import {
  accessTypeOptions,
  CourseAccessType,
  CourseCurrency,
  currencyOptions,
} from "@/types/constants";
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
  accessType: CourseAccessType.free,
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
    router.push("/admin/course");
  };

  useEffect(() => {
    if (course?.data) {
      form.reset(course.data as CourseFormData);
    }
  }, [course, form]);

  if (isLoading) {
    return <FormSpinner />;
  }

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
                {courseId ? "कोर्स संपादित करें" : "नया कोर्स बनाएं"}
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
                ? "बनाया जा रहा है..."
                : isUpdating
                ? "अपडेट किया जा रहा है..."
                : courseId
                ? "कोर्स अपडेट करें"
                : "कोर्स बनाएं"}
            </Button>
          </div>

          <div className="space-y-6 pb-6">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">मूल जानकारी</h3>
              <FormInput
                name="name"
                control={form.control}
                label="कोर्स का नाम *"
                placeholder="कोर्स का नाम डालें"
              />
              <div className="flex items-center gap-4">
                <div className="grow">
                  <FormInput
                    label="कीमत *"
                    name="price"
                    type="number"
                    control={form.control}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-4">
                  <FormSelect
                    label="मुद्रा"
                    name="currency"
                    control={form.control}
                    options={currencyOptions}
                  />

                  <FormSelect
                    label="एक्सेस अवधि"
                    name="accessType"
                    control={form.control}
                    options={accessTypeOptions}
                  />
                </div>
              </div>

              <FormTextarea
                name="description"
                label="विवरण *"
                control={form.control}
              />

              <BenefitsManager form={form} />
            </section>

            <Separator />

            <section className="space-y-4">
              <h3 className="text-lg font-semibold">मीडिया फाइलें</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormFileUpload
                  name="thumbnail"
                  label="कोर्स थंबनेल *"
                  accept="image/*"
                  control={form.control}
                  type="image"
                  folder="course-thumbnails"
                />

                <FormFileUpload
                  name="previewVideo"
                  label="पूर्वावलोकन वीडियो"
                  accept="video/*"
                  control={form.control}
                  type="video"
                  folder="course-preview-videos"
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <h3 className="text-lg font-semibold">कोर्स सामग्री</h3>
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
                "बनाया जा रहा है..."
              ) : isUpdating ? (
                "अपडेट किया जा रहा है..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {courseId ? "अपडेट करें" : "बनाएँ"} कोर्स
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
