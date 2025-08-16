import AllCourse from "@/components/course/AllCouses";
import { getCourses } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

const Courses = async ({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; search?: string }>;
}) => {
  const page = Number((await searchParams)?.page ?? "1");
  const search = (await searchParams)?.search ?? "";
  const pageSize = 10;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["courses", search, page, pageSize],
    queryFn: () => getCourses(page, pageSize, search),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6 space-y-6">
        <AllCourse initialPage={page} initialSearch={search} />
      </div>
    </HydrationBoundary>
  );
};

export default Courses;
