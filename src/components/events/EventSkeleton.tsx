"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const EventPageSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 bg-[#0eff094a]">
      {/* Image Skeleton */}
      <Skeleton className="bg-white w-full h-64 lg:h-96 rounded-lg" />

      {/* Title Skeleton */}
      <Skeleton className="bg-white w-3/4 h-10 lg:h-12 rounded-md" />

      {/* Content Skeleton */}
      <div className="space-y-4">
        <Skeleton className="bg-white w-full h-4 rounded-md" />
        <Skeleton className="bg-white w-full h-4 rounded-md" />
        <Skeleton className="bg-white w-5/6 h-4 rounded-md" />
        <Skeleton className="bg-white w-2/3 h-4 rounded-md" />
      </div>

      {/* Fixed Bottom Button Skeleton */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0eff094a] shadow-strong border-t border-border z-50">
        <div className="container mx-auto px-4 py-3 flex justify-end items-center">
          <Skeleton className="bg-white w-full md:w-64 h-12 rounded-lg" />
        </div>
      </div>

      {/* Testimonials Skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="bg-white w-full h-32 rounded-lg" />
            <Skeleton className="bg-white w-3/4 h-4 rounded-md" />
            <Skeleton className="bg-white w-1/2 h-4 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
};
