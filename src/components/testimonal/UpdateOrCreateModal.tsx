import { useCourses } from "@/hooks/useCourses";
import {
  useCreateTestimonial,
  useUpdateTestimonial,
} from "@/hooks/useTestimonial";
import { testimonialCreateSchema, TestimonialFormData } from "@/types/schema";
import { Course } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import Modal from "../common/CustomDialog";
import CustomImage from "../common/CustomImage";
import { FormFileUpload } from "../common/FileUpload";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Form } from "../ui/form";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: TestimonialFormData | null;
  testimonialId?: string | null;
}

const defaultValues: TestimonialFormData = {
  thumbnail: null,
  video: null,
  courseId: [],
  selectedCourse: [],
};

const AddCourse = ({ form }: { form: UseFormReturn<TestimonialFormData> }) => {
  const [page, setPage] = useState(1);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const { data: courses, isLoading } = useCourses({
    page,
    limit: 10,
  });

  const totalPages = courses?.data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (courses?.data?.items) {
      setAllCourses((prev) => {
        const existingIds = new Set(prev.map((c) => c._id));
        const newItems = courses.data.items.filter(
          (c) => !existingIds.has(c._id)
        );
        return [...prev, ...newItems];
      });
    }
  }, [courses]);

  const selectedCourseIds: string[] = form.watch("courseId") || [];
  const selectedCourse: string[] = form.watch("selectedCourse") || [];

  const toggleCourse = (course: Course) => {
    const current = selectedCourseIds || [];
    const currentCourseName = selectedCourse || [];

    if (current.includes(course._id)) {
      form.setValue(
        "courseId",
        current.filter((id) => id !== course._id)
      );
      form.setValue(
        "selectedCourse",
        currentCourseName.filter(
          (data) => (data as unknown as Course)?._id !== course._id
        )
      );
    } else {
      form.setValue("courseId", [...current, course._id]);
      form.setValue("selectedCourse", [...currentCourseName, course]);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full mb-5 border rounded-md"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1" className="px-2">
        <AccordionTrigger className="px-3">Select Courses</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4">
          {/* Selected Courses */}
          <div className="flex flex-wrap gap-2">
            {selectedCourse.map((course) => (
              <Badge key={(course as unknown as Course)._id}>
                {(course as unknown as Course).name}
                <span
                  onClick={() => toggleCourse(course as unknown as Course)}
                  className="cursor-pointer ml-1"
                >
                  <X className="h-3 w-3" />
                </span>
              </Badge>
            ))}
          </div>

          {/* Courses List */}
          {allCourses.map((course) => (
            <label
              key={course._id}
              className="flex items-center gap-2 cursor-pointer select-none border rounded-md p-2"
            >
              <Checkbox
                checked={selectedCourseIds.includes(course._id)}
                onCheckedChange={() => toggleCourse(course)}
                className="w-4 h-4"
              />
              <div className="flex items-start gap-2">
                <CustomImage
                  src={course?.thumbnail?.url}
                  alt={course.name}
                  className="h-10 w-10 rounded-md"
                />
                <div>
                  <p className="font-medium">{course.name}</p>
                  <p className="line-clamp-2 text-[9px]">
                    {course.description}
                  </p>
                </div>
              </div>
            </label>
          ))}

          {/* 🟢 Load More Button */}
          {page < totalPages && (
            <button
              type="button"
              className="mt-2 px-3 py-1 rounded-md border text-sm hover:bg-gray-100"
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const UpdateModal: React.FC<ModalProps> = ({
  data,
  testimonialId,
  ...props
}) => {
  const { mutateAsync: createTestimonial, isPending: isCreating } =
    useCreateTestimonial();
  const { mutateAsync: updateTestimonial, isPending: isUpdating } =
    useUpdateTestimonial();

  type FormValues = TestimonialFormData;

  const form = useForm<FormValues>({
    defaultValues: data ?? defaultValues,
    resolver: zodResolver(testimonialCreateSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  const handleSubmit: SubmitHandler<FormValues> = async (formData) => {
    if (data && testimonialId) {
      await updateTestimonial({
        data: formData,
        testimonialId: testimonialId,
      }).then(() => {
        props.onClose();
        form.reset();
      });
    } else {
      await createTestimonial(formData).then(() => {
        props.onClose();
        form.reset();
      });
    }
  };

  return (
    <Modal
      {...props}
      onConfirm={form.handleSubmit(handleSubmit)}
      confirmText={
        data
          ? isUpdating
            ? "Updating..."
            : "Update"
          : isCreating
          ? "Adding..."
          : "Add"
      }
      isLoading={isUpdating || isCreating}
      title={data ? "Update Testimonial" : "Add Testimonial"}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid grid-cols-1 space-y-2 mt-5"
        >
          <div className="grid grid-cols-1 lg:gap-2 space-y-2">
            <FormFileUpload
              name="video"
              label="Video File *"
              accept=".mp4,.avi,.mov,.wmv,.flv,.webm"
              type="video"
              control={form.control}
              folder="testimonial-videos"
            />
            <FormFileUpload
              name="thumbnail"
              label="Video Thumbnail"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              type="image"
              placeholder="Upload Thumbnail"
              control={form.control}
              folder="testimonial-thumbnails"
            />
            <AddCourse form={form} />
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export default UpdateModal;
