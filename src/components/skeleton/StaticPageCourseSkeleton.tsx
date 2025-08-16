"use client";

import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";

const CourseSliderSkeleton = () => {
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
          skeletonClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          isLoading={true}
          errorTitle="Error loading courses"
          onRetry={() => {}}
          skeleton={<CourseCardSkeleton />}
        >
          <></>
        </LoadingError>
      </div>
    </section>
  );
};

export default CourseSliderSkeleton;
