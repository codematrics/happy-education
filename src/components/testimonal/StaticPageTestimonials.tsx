"use client";

import { useTestimonials } from "@/hooks/useTestimonial";
import { Course } from "@/types/types";
import { ArrowRight, ChevronLeft, ChevronRight, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CustomVideo from "../common/CustomVideo";
import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

const StaticPageTestimonials = () => {
  const [page, setPage] = useState(1);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const { data, isLoading, refetch } = useTestimonials({ page, limit: 10 });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Append new testimonials to state
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
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
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
            What Our Students Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our successful students
            have to say about their experience.
          </p>
        </div>

        <LoadingError
          skeletonClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          isLoading={isLoading}
          errorTitle="Error loading testimonials"
          onRetry={refetch}
          skeleton={<CourseCardSkeleton />}
        >
          <div className="w-full mb-12 relative">
            <ScrollArea className="w-full overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="flex w-max gap-4 py-4 px-1"
              >
                {allCourses.map((testimonial) => (
                  <Card
                    key={testimonial._id}
                    className="group hover:shadow-lg transition-all duration-200 border-none shadow-none bg-card p-0 space-0 gap-0
                      flex-shrink-0
                      w-[80%] sm:w-1/2 md:w-1/3 lg:w-1/4"
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
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }).format(new Date(testimonial.createdAt))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {canScrollLeft && (
              <Button
                onClick={() => scrollBy(-300)}
                className="absolute top-1/2 -translate-y-1/2 left-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
              >
                <ChevronLeft className="text-primary" />
              </Button>
            )}
            {canScrollRight && (
              <Button
                onClick={() => scrollBy(300)}
                className="absolute top-1/2 -translate-y-1/2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
              >
                <ChevronRight className="text-primary" />
              </Button>
            )}
          </div>
        </LoadingError>

        <div className="text-center">
          <Link href="/testimonials">
            <Button
              size="lg"
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground transition-smooth group"
            >
              See All Reviews
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StaticPageTestimonials;
