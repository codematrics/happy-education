import InquiryTable from "@/components/inquiry/InquiryTable";
import { getInquiry } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function Users({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; search?: string }>;
}) {
  const page = Number((await searchParams)?.page ?? "1");
  const search = (await searchParams)?.search ?? "";
  const pageSize = 10;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["Inquiries", search, page, pageSize],
    queryFn: () => getInquiry(page, pageSize, search),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6 space-y-6">
        <InquiryTable initialPage={page} initialSearch={search} />
      </div>
    </HydrationBoundary>
  );
}
