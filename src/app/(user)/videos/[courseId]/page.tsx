import CourseVideoLine from "@/components/my-course/CourseVideoLine";

export default async function VideosPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return <CourseVideoLine courseId={courseId} />;
}