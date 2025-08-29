"use client";

import CourseCard from "@/components/course/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourses } from "@/hooks/useCourses";
import { coursesSortOptions } from "@/types/constants";
import { getSortParams } from "@/utils/data";
import { Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";

interface Props {
  initialSearch: string;
  initialPage: number;
}

const AllCourse: React.FC<Props> = ({ initialSearch, initialPage }) => {
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState("newest");
  const [courses, setCourses] = useState<any[]>([]);

  const limit = 10;
  const sortParams = getSortParams(sort);

  const { data, isLoading, refetch, error } = useCourses({
    page,
    limit,
    search,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
  });

  useEffect(() => {
    if (data?.data?.items) {
      if (page === 1) {
        setCourses(data.data.items);
      } else {
        setCourses((prev) => [...prev, ...data.data.items]); // append on load more
      }
    }
  }, [data, page]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const totalCourses = data?.data?.pagination?.total || 0;
  const hasMore = data?.data?.pagination?.hasNext;

  return (
    <div className="min-h-dvh py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">All Courses</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive collection of courses designed to help you
            master new skills and advance your career.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-2xl p-6 shadow-soft mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">
                Search Courses
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by title or description..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">Sort By</label>
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
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing {courses.length} of {totalCourses} courses
          </p>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Filtered results
            </span>
          </div>
        </div>

        {/* Courses Grid/List */}
        <LoadingError
          isLoading={isLoading && page === 1}
          errorTitle="Failed to Load Courses"
          error={error?.message}
          onRetry={refetch}
          skeleton={<CourseCardSkeleton />}
        >
          {courses.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onBuy={() => {}}
                    showBuy
                    showBenefits
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-10">
                  <Button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={isLoading}
                    className="w-full md:w-auto"
                  >
                    {isLoading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                <Search className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find what you're
                looking for.
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setSort("newest");
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </LoadingError>
      </div>
    </div>
  );
};

export default AllCourse;
