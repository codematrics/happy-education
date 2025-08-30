"use client";

import CustomDropdown from "@/components/common/CustomDropdown";
import { CustomPagination } from "@/components/common/CustomPagination";
import { CustomTable } from "@/components/common/CustomTable";
import LoadingError from "@/components/common/LoadingError";
import { CustomTableSkeleton } from "@/components/skeleton/CustomTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAdminRevenue } from "@/hooks/useAdminRevenue";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Search, User } from "lucide-react";
import { useState } from "react";

interface Props {
  initialPage: number;
  initialSearch: string;
}

const RevenueTable: React.FC<Props> = ({ initialPage, initialSearch }) => {
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);

  const limit = 10;

  const { data, isLoading, refetch, error } = useAdminRevenue({
    page,
    limit,
  });

  const userDropdownData = {
    label: <MoreHorizontal className="h-4 w-4" />,
    options: [
      {
        label: "उपयोगकर्ता देखें",
        action: (row: any) =>
          window.open(`/admin/users?search=${row.user.id}`, "_blank"),
        icon: User,
      },
      {
        label: "कोर्स देखें",
        action: (row: any) =>
          window.open(`/admin/course/${row.course.id}`, "_blank"),
        icon: Eye,
      },
    ],
  };

  const columns: ColumnDef<any>[] = [
    { id: "rowNumber", header: "#", cell: ({ row }) => "#" + (row.index + 1) },
    {
      accessorKey: "user.name",
      header: "उपयोगकर्ता",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.user.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.user.email}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "course.accessType",
      header: "एक्सेस प्रकार",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.course.accessType}</span>
      ),
    },
    {
      accessorKey: "course.name",
      header: "कोर्स का नाम",
      cell: ({ row }) => (
        <span className="line-clamp-1">{row.original.course.name}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "राशि",
      cell: ({ row }) => (
        <span>
          {row.original.currency === "USD" ? "$" : "₹"}
          {row.original.amount.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "स्थिति",
      cell: ({ row }) => (
        <Badge
          className="capitalize"
          variant={
            row.original?.status === "pending"
              ? "secondary"
              : row.original?.status === "success"
              ? "outline"
              : "destructive"
          }
        >
          {row.original?.status === "success"
            ? "सफल"
            : row.original?.status === "pending"
            ? "प्रक्रियाधीन"
            : "असफल"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "लेन-देन तिथि",
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(row.original.createdAt)),
    },
    {
      accessorKey: "orderId",
      header: "लेन-देन ID",
      cell: ({ row }) => (
        <div>
          <p className="font-mono text-xs">{row.original.orderId}</p>
          <p className="text-muted-foreground text-xs">
            {row.original.paymentId}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "कार्रवाई",
      cell: ({ row }) => (
        <CustomDropdown {...userDropdownData} data={row.original} />
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">राजस्व</h1>
          <p className="text-muted-foreground">सभी लेन-देन देखें</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between my-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="लेन-देन खोजें..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      <LoadingError
        isLoading={isLoading}
        errorTitle="लेन-देन लोड करने में त्रुटि"
        onRetry={refetch}
        skeleton={<CustomTableSkeleton columns={columns.length} />}
      >
        {data?.data?.transactions?.length ? (
          <>
            <CustomTable data={data?.data?.transactions} columns={columns} />
            {data?.data?.pagination && (
              <CustomPagination
                page={page}
                totalPages={data?.data?.pagination?.totalPages}
                hasNext={data?.data?.pagination?.hasNextPage}
                hasPrev={data?.data?.pagination?.hasPreviousPage}
                limit={limit}
                total={data?.data?.pagination?.totalCount}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {search
              ? "कोई लेन-देन आपकी खोज से मेल नहीं खाता।"
              : "कोई लेन-देन उपलब्ध नहीं है।"}
          </div>
        )}
      </LoadingError>
    </>
  );
};

export default RevenueTable;
