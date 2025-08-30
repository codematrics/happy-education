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
    header: "प्रथम नाम",
  },
  {
    accessorKey: "phone",
    header: "फोन नंबर",
    cell: ({ row }) => row.getValue("phone") || "-",
  },
  {
    accessorKey: "message",
    header: "संदेश",
    cell: ({ row }) => row.getValue("message") || "-",
  },
  {
    accessorKey: "createdAt",
    header: "सृजन तिथि",
    cell: ({ row }) =>
      row.getValue("createdAt") ? formatDate(row.getValue("createdAt")) : "-",
  },
  {
    accessorKey: "actions",
    header: "कार्रवाइयाँ",
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
          <h1 className="text-2xl font-bold text-foreground">इनक्वायरीज़</h1>
          <p className="text-muted-foreground">
            अपनी इनक्वायरी सूची प्रबंधित करें
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="इनक्वायरी खोजें..."
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
        errorTitle="यूज़र्स लोड करने में त्रुटि"
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
                ? "आपकी खोज से मेल खाने वाली कोई इनक्वायरी नहीं मिली।"
                : "कोई इनक्वायरी उपलब्ध नहीं है।"}
            </div>
          </div>
        )}
      </LoadingError>
    </>
  );
};

export default InquiryTable;
