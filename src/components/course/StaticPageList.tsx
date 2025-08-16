"use client";

import { useCourses } from "@/hooks/useCourses";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import CourseCard from "./CourseCard";

const limit = 4;

const CourseSlider = () => {
  const [page, setPage] = useState(1);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const { data, isLoading, refetch } = useCourses({ page, limit });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Append new courses to state
  useEffect(() => {
    if (data?.data?.items) {
      setAllCourses((prev) => {
        const newCourses = data.data.items.filter(
          (c: any) => !prev.some((p) => p._id === c._id)
        );
        return [...prev, ...newCourses];
      });
    }
  }, [data]);

  // Scroll detection logic
  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const scrollBy = (distance: number) => {
    scrollContainerRef.current?.scrollBy({
      left: distance,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [allCourses]);

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
          <div className="w-full mb-12 relative">
            <ScrollArea className="w-full overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="flex gap-4 py-4 px-1 snap-x snap-mandatory"
              >
                {allCourses.map((course) => (
                  <div
                    key={course._id}
                    className="snap-start flex-shrink-0 w-full sm:w-full md:w-1/2 lg:w-1/3"
                  >
                    <CourseCard
                      course={course}
                      showBuy
                      onBuy={() => {}}
                      showBenefits={false}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {canScrollLeft && (
              <Button
                onClick={() => scrollBy(-300)}
                className="absolute top-1/2 -translate-y-1/2 left-2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
              >
                <ChevronLeft />
              </Button>
            )}
            {canScrollRight && (
              <Button
                onClick={() => scrollBy(300)}
                className="absolute top-1/2 -translate-y-1/2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
              >
                <ChevronRight />
              </Button>
            )}
          </div>
        </LoadingError>
      </div>
    </section>
  );
};

export default CourseSlider;
