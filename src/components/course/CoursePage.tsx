"use client";

import { useCourses } from "@/hooks/useCourses";
import { coursesSortOptions } from "@/types/constants";
import { CourseFormData, CourseVideoFormData } from "@/types/schema";
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import DeleteConfirmDialog from "../common/DeleteConfirmation";
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
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState("newest");
  const [editingCourse, setEditingCourse] = useState<
    CourseFormData | undefined
  >();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    courseId: string;
    courseName: string;
  }>({
    isOpen: false,
    courseId: "",
    courseName: "",
  });
  const limit = 10;

  const { data, isLoading } = useCourses({ page, limit, search });
  const router = useRouter();
  const handleSearch = (value: string) => {
    setSearch(value);
    // applyFilters(value, sortBy, courses);
  };

  const handleSort = (value: string) => {
    setSort(value);
    // applyFilters(searchTerm, value, courses);
  };

  const handleCreateCourse = () => {
    // setEditingCourse(undefined);
    // setIsFormOpen(true);
    router.push("/admin/course/new");
  };

  const handleEditCourse = (course: CourseFormData) => {
    setEditingCourse(course);
    // setIsFormOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    // const course = courses.find((c) => c.id === courseId);
    // if (course) {
    //   setDeleteConfirm({
    //     isOpen: true,
    //     courseId,
    //     courseName: course.name,
    //   });
    // }
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

    setDeleteConfirm({ isOpen: false, courseId: "", courseName: "" });
  };

  const handleFormSubmit = (
    data: CourseFormData & { courseVideos?: CourseVideoFormData[] }
  ) => {
    if (editingCourse) {
      // Update existing course
      // const updatedCourses = courses.map((course) =>
      //   course.id === editingCourse.id ? { ...course, ...data } : course
      // );
      // setCourses(updatedCourses);
      // applyFilters(searchTerm, sortBy, updatedCourses);
    } else {
      // Create new course
      // const newCourse: ICourse = {
      //   id: Date.now().toString(),
      //   ...data,
      //   createdAt: new Date(),
      //   courseVideos: data.courseVideos || [],
      // };
      // const updatedCourses = [newCourse, ...courses];
      // setCourses(updatedCourses);
      // applyFilters(searchTerm, sortBy, updatedCourses);
    }
  };

  const handleViewVideos = (courseId: string) => {
    // toast({
    //   title: "Feature Coming Soon",
    //   description: "Video management feature will be available soon.",
    // });
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
                <SelectItem value="newest">Newest First</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg p-1">
            <Button
              // variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              // onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              // variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              // onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {data?.data?.items?.length > 0 ? (
        <div
          className={
            // viewMode === "grid"
            // ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            // : "space-y-4"
            "space-y-4"
          }
        >
          {data?.data?.items.map((course) => (
            <CourseCard
              key={course.name}
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

      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, courseId: "", courseName: "" })
        }
        onConfirm={confirmDelete}
        itemName={deleteConfirm.courseName}
      />
    </>
  );
};

export default CoursePage;
