import AllTestimonial from "@/components/testimonal/AllTestimonials";
import { getTestimonial } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function Testimonials({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; search?: string }>;
}) {
  const page = Number((await searchParams)?.page ?? "1");
  const pageSize = 10;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["testimonials", page, pageSize],
    queryFn: () => getTestimonial(page, pageSize),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6 space-y-6">
        <AllTestimonial initialPage={page} />
      </div>
    </HydrationBoundary>
  );
}
