import UserPage from "@/components/user/UsersTable";
import { getUsers } from "@/lib/api";
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
    queryKey: ["Users", search, page, pageSize],
    queryFn: () => getUsers(page, pageSize, search),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6 space-y-6">
        <UserPage initialPage={page} initialSearch={search} />
      </div>
    </HydrationBoundary>
  );
}
