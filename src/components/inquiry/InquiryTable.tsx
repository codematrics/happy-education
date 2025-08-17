"use client";

import { useInquiries } from "@/hooks/useInquiry";
import { coursesSortOptions } from "@/types/constants";
import { Inquiry } from "@/types/types";
import { getSortParams } from "@/utils/data";
import { formatDate } from "@/utils/date";
import { ColumnDef } from "@tanstack/react-table";
import { Phone, Search } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { CustomPagination } from "../common/CustomPagination";
import { CustomTable } from "../common/CustomTable";
import LoadingError from "../common/LoadingError";
import { CustomTableSkeleton } from "../skeleton/CustomTable";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  initialSearch: string;
  initialPage: number;
}

const columns: ColumnDef<Inquiry>[] = [
  {
    id: "rowNumber",
    header: "#",
    cell: ({ row }) => {
      return "#" + String(row.index + 1);
    },
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },

  {
    accessorKey: "phone",
    header: "Phone Number",
    cell: ({ row }) => row.getValue("phone") || "-",
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => row.getValue("message") || "-",
  },
  {
    accessorKey: "createdAt",
    header: "Creation Date",
    cell: ({ row }) =>
      row.getValue("createdAt") ? formatDate(row.getValue("createdAt")) : "-",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`tel:${row.original?.phone}`}>
        <Phone className="w-3 h-3 text-primary" />
      </Link>
    ),
  },
];

const InquiryTable: React.FC<Props> = ({ initialSearch, initialPage }) => {
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState("newest");

  const limit = 10;
  const sortParams = getSortParams(sort);
  const { data, isLoading, refetch } = useInquiries({
    page,
    limit,
    search,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inquiries</h1>
          <p className="text-muted-foreground">Manage your inquiry catalog</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inquiry..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={sort} onValueChange={handleSort}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {coursesSortOptions.map((options) => (
                <SelectItem key={options.value} value={options.value}>
                  {options.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <LoadingError
        isLoading={isLoading}
        errorTitle="Error loading Users"
        onRetry={refetch}
        skeleton={<CustomTableSkeleton columns={columns.length} />}
      >
        {(data?.data?.items?.length ?? 0) > 0 ? (
          <>
            <CustomTable data={data?.data?.items || []} columns={columns} />
            {data?.data?.pagination && (
              <CustomPagination
                {...data?.data?.pagination}
                onPageChange={(page) => setPage(page)}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {search
                ? "No Inquiries found matching your search."
                : "No Inquiries available."}
            </div>
          </div>
        )}
      </LoadingError>
    </>
  );
};

export default InquiryTable;
