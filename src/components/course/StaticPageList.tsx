"use client";

import { useCourses } from "@/hooks/useCourses";
import { Course } from "@/types/types";
import CustomCarousel from "../common/CustomCarousel";
import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";
import CourseCard from "./CourseCard";

const limit = 4;

const CourseSlider = () => {
  const { data, isLoading, refetch } = useCourses({ page: 1, limit });

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Trending Courses
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular courses that are helping thousands of
            students achieve their goals.
          </p>
        </div>
        <LoadingError
          skeletonClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          isLoading={isLoading}
          errorTitle="Error loading courses"
          onRetry={refetch}
          skeleton={<CourseCardSkeleton />}
        >
          <div className="mb-12 max-w-full px-10">
            <CustomCarousel
              data={data?.data?.items || []}
              className="basis-1/1 md:basis-1/2 lg:sm:basis-1/3"
              render={(course: Course) => (
                <CourseCard
                  course={course}
                  showBuy
                  onBuy={() => {}}
                  showBenefits={false}
                />
              )}
            />
          </div>
        </LoadingError>
      </div>
    </section>
  );
};

export default CourseSlider;
