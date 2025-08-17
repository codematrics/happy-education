import MyCourses from "@/components/my-course/MyCourse";
import { getCourses, getMyCourses } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function MyCoursesPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["my-courses", 1, 20, "", "createdAt", "desc"],
    queryFn: () => getMyCourses(1, 12, ""),
  });

  await queryClient.prefetchQuery({
    queryKey: ["courses", 1, 12, "", "createdAt", "desc"],
    queryFn: () => getCourses(1, 12, ""),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyCourses />
    </HydrationBoundary>
  );
}
