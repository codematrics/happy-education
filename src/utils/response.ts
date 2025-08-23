import { PaginationResult } from "@/lib/pagination";
import { ResponseInterface } from "@/types/types";
import { NextResponse } from "next/server";

export const response = {
  error: (message: string, status: ResponseInit["status"]) =>
    NextResponse.json({ data: null, message, status: false }, { status }),

  success: <T>(data: T, message: string, status: ResponseInit["status"]) =>
    NextResponse.json({ data, message, status: true }, { status }),

  paginatedResponse: <T>(
    data: ResponseInterface<{
      items: T[];
      pagination: PaginationResult<T>["pagination"];
    }>,
    status: ResponseInit["status"]
  ) => NextResponse.json(data, { status }),
};
