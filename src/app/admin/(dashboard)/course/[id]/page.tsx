import CourseForm from "@/components/course/CourseForm";
import { getCourseById } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function Courses({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const courseId = (await params).id;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [courseId],
    queryFn: () => getCourseById(courseId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CourseForm courseId={courseId} />
    </HydrationBoundary>
  );
}
