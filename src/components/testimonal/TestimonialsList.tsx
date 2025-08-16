"use client";

import { useDeleteTestimonial, useTestimonials } from "@/hooks/useTestimonial";
import { TestimonialFormData } from "@/types/schema";
import { Course, Testimonial } from "@/types/types";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { CustomPagination } from "../common/CustomPagination";
import DeleteConfirmDialog from "../common/DeleteConfirmation";
import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";
import { Button } from "../ui/button";
import TestimonialCard from "./TestimonialCard";
import UpdateModal from "./UpdateOrCreateModal";

interface Props {
  initialPage: number;
}

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onDelete: () => void | Promise<void>;
  testimonialId: string;
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TestimonialFormData | null;
  testimonialId: string | null;
}

const TestimonialList: React.FC<Props> = ({ initialPage }) => {
  const [page, setPage] = useState(initialPage);
  const [updateModal, setUpdateModal] = useState<UpdateModalProps>({
    isOpen: false,
    onClose: () => setUpdateModal((prev) => ({ ...prev, isOpen: false })),
    data: null,
    testimonialId: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmDialogProps>({
    isOpen: false,
    testimonialId: "",
    onDelete: () => {},
  });

  const limit = 10;
  const { mutateAsync: deleteTestimonial } = useDeleteTestimonial();
  const { data, isLoading, refetch } = useTestimonials({
    page,
    limit,
  });

  const handleCreateTestimonial = () =>
    setUpdateModal((pre) => ({
      ...pre,
      isOpen: true,
      data: null,
      testimonialId: null,
    }));

  const handleEditTestimonial = (testimonial: Testimonial) => {
    const courseIds = Array.isArray(testimonial.courseId)
      ? testimonial.courseId.map((course: any) => course._id || course)
      : [(testimonial.courseId as Course)._id || testimonial.courseId].filter(
          Boolean
        );

    const formData: TestimonialFormData = {
      thumbnail: testimonial.thumbnail?.url || null,
      video: testimonial.video?.url || null,
      courseId: courseIds,
      selectedCourse: testimonial.courseId,
    };
    setUpdateModal({
      isOpen: true,
      onClose: () => setUpdateModal((prev) => ({ ...prev, isOpen: false })),
      data: formData,
      testimonialId: testimonial._id,
    });
  };

  const handleDeleteTestimonial = (testimonialId: string) => {
    setDeleteConfirm({
      isOpen: true,
      testimonialId,
      onDelete: async () => {
        await deleteTestimonial(testimonialId);
        setDeleteConfirm({
          isOpen: false,
          testimonialId: "",
          onDelete: () => {},
        });
      },
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage your testimonial catalog
          </p>
        </div>
        <Button
          onClick={handleCreateTestimonial}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <LoadingError
        skeletonClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        isLoading={isLoading}
        errorTitle="Error loading courses"
        onRetry={refetch}
        skeleton={<CourseCardSkeleton />}
      >
        {(data?.data?.items?.length ?? 0) > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.data?.items?.map((testimonial) => (
                <TestimonialCard
                  key={testimonial._id}
                  onEdit={handleEditTestimonial}
                  onDelete={handleDeleteTestimonial}
                  testimonial={testimonial}
                  showMoreMenu
                />
              ))}
            </div>
            {data?.data?.pagination && (
              <CustomPagination
                {...data?.data?.pagination}
                onPageChange={(page) => setPage(page)}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              No Testimonial available.
            </div>
          </div>
        )}
      </LoadingError>

      <UpdateModal
        isOpen={updateModal.isOpen}
        onClose={updateModal.onClose}
        data={updateModal.data}
        testimonialId={updateModal.testimonialId}
      />
      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            testimonialId: "",
            onDelete: () => {},
          })
        }
        onConfirm={deleteConfirm.onDelete}
        title="Delete Testimonial"
        description={`Are you sure you want to delete "Testimonial"? This action cannot be undone and will permanently remove this course and all associated data.`}
      />
    </>
  );
};

export default TestimonialList;
