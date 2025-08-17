"use client";

import { useTestimonials } from "@/hooks/useTestimonial";
import { Testimonial } from "@/types/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import CustomCarousel from "../common/CustomCarousel";
import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";
import { Button } from "../ui/button";
import TestimonialCard from "./TestimonialCard";

const StaticPageTestimonials = () => {
  const { data, isLoading, refetch } = useTestimonials({ page: 1, limit: 10 });

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
          <div className="mb-12 px-10">
            <CustomCarousel
              data={data?.data?.items || []}
              render={(testimonial: Testimonial) => (
                <TestimonialCard testimonial={testimonial} />
              )}
              className="basis-1/1 sm:basis-1/2 md:basis-1/3"
            />
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
