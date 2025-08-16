"use client";

import { useDeleteTestimonial, useTestimonials } from "@/hooks/useTestimonial";
import { TestimonialFormData } from "@/types/schema";
import { Course, DropdownProps, Testimonial } from "@/types/types";
import { Edit, MoreHorizontal, Plus, Trash2, Video } from "lucide-react";
import React, { useState } from "react";
import CustomDropdown from "../common/CustomDropdown";
import { CustomPagination } from "../common/CustomPagination";
import CustomVideo from "../common/CustomVideo";
import DeleteConfirmDialog from "../common/DeleteConfirmation";
import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
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
              {data?.data?.items?.map((testimonial) => {
                const testimonialDropdownData: DropdownProps = {
                  label: <MoreHorizontal className="h-4 w-4" />,
                  options: [
                    {
                      label: "Edit",
                      action: () => handleEditTestimonial(testimonial),
                      icon: Edit,
                    },
                    {
                      label: "Delete",
                      action: () => handleDeleteTestimonial(testimonial._id),
                      icon: Trash2,
                      itemClassName: "text-destructive hover:text-destructive",
                      iconClassName: "text-destructive",
                    },
                  ],
                };

                const formatDate = (date: Date) => {
                  return new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(date));
                };

                return (
                  <Card
                    key={testimonial._id}
                    className="group hover:shadow-lg transition-all duration-200 border-none shadow-none bg-card p-0 space-0 gap-0"
                  >
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        {testimonial.video?.url ? (
                          <CustomVideo
                            src={testimonial.video.url}
                            thumbnail={testimonial?.thumbnail?.url}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-48 bg-muted flex items-center justify-center">
                            <Video className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <CustomDropdown {...testimonialDropdownData} />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-2">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(testimonial.courseId) ? (
                            testimonial.courseId.map(
                              (course: any, index: number) => (
                                <Badge
                                  key={course._id || index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {course.name || "Unknown"}
                                </Badge>
                              )
                            )
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {(testimonial.courseId as Course)?.name ||
                                "Unknown"}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-end">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(testimonial.createdAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
