import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import { getAdminRevenue } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Happy Education",
  description: "Overview of platform performance and key metrics",
};

const DashboardPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; search?: string }>;
}) => {
  const page = Number((await searchParams)?.page ?? "1");
  const search = (await searchParams)?.search ?? "";
  const pageSize = 10;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["admin-revenue", search, page, pageSize],
    queryFn: () => getAdminRevenue(page, pageSize, search),
  });

  return (
    <div className="p-6">
      <DashboardStats />
    </div>
  );
};

export default DashboardPage;
