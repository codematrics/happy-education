import RevenueTable from "@/components/admin/revenue/RevenueTable";
import { getAdminRevenue } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaction Management - Admin Panel",
  description: "View, filter, and export all transaction data",
};

const TransactionsPage = async ({
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
      <RevenueTable initialPage={page} initialSearch="" />
    </div>
  );
};

export default TransactionsPage;
