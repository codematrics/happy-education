import CourseVideoTimeline from "@/components/course/CourseVideoTimeline";
import { getCourseById } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function CourseVideosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  // Prefetch course data with videos
  await queryClient.prefetchQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6 space-y-6">
        <CourseVideoTimeline courseId={id} />
      </div>
    </HydrationBoundary>
  );
}