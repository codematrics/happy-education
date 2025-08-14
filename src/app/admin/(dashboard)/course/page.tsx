"use client";

import CoursePage from "@/components/course/CoursePage";
import { getCourses } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  thumbnail?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default async function Courses({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; search?: string }>;
}) {
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
        <CoursePage initialPage={page} initialSearch={search} />
      </div>
    </HydrationBoundary>
  );
}
