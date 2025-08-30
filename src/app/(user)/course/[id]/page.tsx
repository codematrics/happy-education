import CourseDetails from "@/components/course/CourseDetails";
import { getCourseById, getEvents } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";

export default async function CourseDetailsPage({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  const id = (await params)?.id;

  if (!id) {
    return notFound();
  }

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [id, id],
    queryFn: () => getCourseById(id),
  });

  await queryClient.prefetchQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6 space-y-6">
        <CourseDetails courseId={id} />
      </div>
    </HydrationBoundary>
  );
}
