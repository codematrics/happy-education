import CourseVideoLine from "@/components/my-course/CourseVideoLine";
import { getCourseById, getCourseProgress, getMyVideos } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { getUserAuthCookie } from "@/utils/cookie";

export default async function VideosPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
  });

  await queryClient.prefetchQuery({
    queryKey: [`course-video-${courseId}`, courseId],
    queryFn: () => getMyVideos(courseId),
  });

  await queryClient.prefetchQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: () => getCourseProgress(courseId),
  });

  const token = await getUserAuthCookie();
  const isAuthenticated = !!token;

  return (
    <CourseVideoLine courseId={courseId} isAuthenticated={isAuthenticated} />
  );
}
