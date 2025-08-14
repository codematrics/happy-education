"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "name",
    header: "Course Name",
  },
  {
    accessorKey: "price",
    header: "Course Price",
  },
  {
    accessorKey: "createdAt",
    header: "Course Creation Date",
  },
];
