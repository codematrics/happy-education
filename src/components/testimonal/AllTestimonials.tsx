"use client";

import { Button } from "@/components/ui/button";
import { useTestimonials } from "@/hooks/useTestimonial";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";
import TestimonialCard from "./TestimonialCard";

interface Props {
  initialPage: number;
}

const AllTestimonial: React.FC<Props> = ({ initialPage }) => {
  const [page, setPage] = useState(initialPage);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  const limit = 10;

  const { data, isLoading, refetch, error } = useTestimonials({
    page,
    limit,
  });

  useEffect(() => {
    if (data?.data?.items) {
      if (page === 1) {
        setTestimonials(data.data.items);
      } else {
        setTestimonials((prev) => [...prev, ...data.data.items]); // append on load more
      }
    }
  }, [data, page]);

  const hasMore = data?.data?.pagination?.hasNext;

  return (
    <div className="min-h-dvh py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            All Testimonials
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch inspiring video testimonials from our students sharing their
            success stories and course experiences. Real people, real
            transformations, real results.
          </p>
        </div>

        {/* Courses Grid/List */}
        <LoadingError
          isLoading={isLoading && page === 1}
          errorTitle="Failed to Load Testimonials"
          error={error?.message}
          onRetry={refetch}
          skeleton={<CourseCardSkeleton />}
        >
          {testimonials.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial._id}
                    testimonial={testimonial}
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
              <h3 className="text-2xl font-semibold mb-2">
                No Testimonials found
              </h3>
            </div>
          )}
        </LoadingError>
      </div>
    </div>
  );
};

export default AllTestimonial;
