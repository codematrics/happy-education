"use client";

import { useCourses, useDeleteCourse } from "@/hooks/useCourses";
import { coursesSortOptions } from "@/types/constants";
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import DeleteConfirmDialog from "../common/DeleteConfirmation";
import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import CourseCard from "./CourseCard";

interface Props {
  initialSearch: string;
  initialPage: number;
}

const CoursePage: React.FC<Props> = ({ initialSearch, initialPage }) => {
  const [search, setSearch] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState("newest");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    courseId: string;
    courseName: string;
    onDelete: () => void | Promise<void>;
  }>({
    isOpen: false,
    courseId: "",
    courseName: "",
    onDelete: () => {},
  });
  const limit = 10;

  // Map sort values to API parameters
  const getSortParams = (sortValue: string) => {
    switch (sortValue) {
      case "newest":
        return { sortBy: "createdAt", sortOrder: "desc" as const };
      case "oldest":
        return { sortBy: "createdAt", sortOrder: "asc" as const };
      case "name":
        return { sortBy: "name", sortOrder: "asc" as const };
      case "price-low":
        return { sortBy: "price", sortOrder: "asc" as const };
      case "price-high":
        return { sortBy: "price", sortOrder: "desc" as const };
      default:
        return { sortBy: "createdAt", sortOrder: "desc" as const };
    }
  };

  const sortParams = getSortParams(sort);
  const { mutateAsync: deleteCourse } = useDeleteCourse();
  const { data, isLoading, refetch } = useCourses({ 
    page, 
    limit, 
    search, 
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder
  });
  const router = useRouter();

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1); // Reset to first page when sorting
  };

  const handleCreateCourse = () => {
    // setEditingCourse(undefined);
    // setIsFormOpen(true);
    router.push("/admin/course/new");
  };

  const handleEditCourse = (courseId: string) =>
    router.push(`/admin/course/${courseId}`);

  const handleDeleteCourse = (courseId: string) => {
    setDeleteConfirm({
      isOpen: true,
      courseId,
      courseName: data?.data?.items.find((c) => c._id === courseId)?.name || "",
      onDelete: async () => {
        await deleteCourse(courseId);
        setDeleteConfirm({
          isOpen: false,
          courseId: "",
          courseName: "",
          onDelete: () => {},
        });
      },
    });
  };

  const confirmDelete = () => {
    // const updatedCourses = courses.filter(
    //   (c) => c.id !== deleteConfirm.courseId
    // );
    // setCourses(updatedCourses);
    // applyFilters(searchTerm, sortBy, updatedCourses);

    // toast({
    //   title: "Course Deleted",
    //   description: `Course "${deleteConfirm.courseName}" has been deleted successfully.`,
    // });

    setDeleteConfirm({
      isOpen: false,
      courseId: "",
      courseName: "",
      onDelete: () => {},
    });
  };

  const handleViewVideos = (courseId: string) => {
    router.push(`/admin/course/${courseId}/videos`);
  };
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground">Manage your course catalog</p>
        </div>
        <Button
          onClick={handleCreateCourse}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={sort} onValueChange={handleSort}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {coursesSortOptions.map((options) => (
                <SelectItem key={options.value} value={options.value}>
                  {options.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <LoadingError
        skeletonClassName={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }
        isLoading={isLoading}
        errorTitle="Error loading courses"
        onRetry={refetch}
        skeleton={<CourseCardSkeleton />}
      >
        {(data?.data?.items?.length ?? 0) > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {data?.data?.items?.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
                onViewVideos={handleViewVideos}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {search
                ? "No courses found matching your search."
                : "No courses available."}
            </div>
            {!search && (
              <Button className="mt-4">Create Your First Course</Button>
            )}
          </div>
        )}
      </LoadingError>

      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            courseId: "",
            courseName: "",
            onDelete: () => {},
          })
        }
        onConfirm={deleteConfirm.onDelete}
        itemName={deleteConfirm.courseName}
        itemType="course"
      />
    </>
  );
};

export default CoursePage;
