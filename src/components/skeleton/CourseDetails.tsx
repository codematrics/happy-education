"use client";

import { Skeleton } from "@/components/ui/skeleton";

const CourseDetailsSkeleton = () => {
  return (
    <div className="min-h-screen space-y-10">
      {/* Header Section */}
      <section className="relative py-10 lg:py-20 bg-gradient-to-r from-primary/10 to-info/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4 rounded-lg" />{" "}
              {/* Course Title */}
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-2/3 rounded mt-2" />
              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-6 w-20 rounded" />
              </div>
              {/* Price */}
              <div className="flex items-center space-x-4 mt-4">
                <Skeleton className="h-10 w-24 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl shadow-strong overflow-hidden sticky top-24 space-y-4 p-6">
                <Skeleton className="h-48 w-full rounded-2xl" />{" "}
                {/* Video/Image */}
                <Skeleton className="h-12 w-full rounded-lg mt-4" />{" "}
                {/* Enroll button */}
                <Skeleton className="h-4 w-1/2 rounded mt-2" />{" "}
                {/* Guarantee text */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Course Description */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3 rounded-lg" /> {/* Heading */}
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>

              {/* What You’ll Learn */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3 rounded-lg" />
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <Skeleton className="h-6 w-6 rounded-full" /> {/* Icon */}
                      <Skeleton className="h-4 w-full rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/4 rounded-lg" />
                <div className="flex items-start space-x-4 mt-2">
                  <Skeleton className="h-20 w-20 rounded-full" /> {/* Avatar */}
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-1/2 rounded" /> {/* Name */}
                    <Skeleton className="h-4 w-full rounded" /> {/* Bio */}
                    <Skeleton className="h-4 w-3/4 rounded" />{" "}
                    {/* Extra info */}
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3 rounded-lg" />
                <div className="flex space-x-4 mt-2 overflow-x-auto">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton
                      key={idx}
                      className="h-40 w-80 rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              </div>

              {/* Related Courses */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/4 rounded-lg" />
                <div className="flex space-x-4 mt-2 overflow-x-auto">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton
                      key={idx}
                      className="h-40 w-60 rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
                <Skeleton className="h-8 w-1/2 rounded-lg" />{" "}
                {/* Related heading */}
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="flex space-x-3 items-center">
                    <Skeleton className="h-12 w-16 rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailsSkeleton;
