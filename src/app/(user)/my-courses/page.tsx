import MyCourses from "@/components/my-course/MyCourse";
import { getMyCourses } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

// Increase build timeout for this page
export const maxDuration = 60;

export default async function MyCoursesPage() {
  const queryClient = getQueryClient();

  // Reduce prefetch size and add error handling
  try {
    // Prefetch only essential data with smaller limits
    await queryClient.prefetchQuery({
      queryKey: ["my-courses", 1, 6, "", "createdAt", "desc"],
      queryFn: () => getMyCourses(1, 6, ""),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Skip prefetching explore courses to reduce build time
    // This data will be fetched client-side when needed
  } catch (error) {
    console.error("Failed to prefetch my courses:", error);
    // Continue rendering even if prefetch fails
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyCourses />
    </HydrationBoundary>
  );
}
