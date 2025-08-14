import { ResponseInterface } from "@/types/types";
import { FilterQuery, Model, SortOrder } from "mongoose";

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationQueryOptions extends PaginationOptions {
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  searchFields?: string[];
}

/**
 * Generic pagination utility for MongoDB queries
 * @param model - Mongoose model
 * @param query - MongoDB query filter
 * @param options - Pagination options
 * @returns Paginated result with metadata
 */
export async function paginate<T>(
  model: Model<T>,
  query: FilterQuery<T> = {},
  options: PaginationQueryOptions = { page: 1, limit: 10 }
): Promise<PaginationResult<T>> {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
    search,
    searchFields = [],
  } = options;

  // Ensure positive values
  const currentPage = Math.max(1, page);
  const perPage = Math.max(1, Math.min(limit, 100)); // Max 100 items per page

  // Build search query if provided
  let finalQuery = { ...query };
  if (search && searchFields.length > 0) {
    const searchRegex = new RegExp(search, "i");
    finalQuery = {
      ...query,
      $or: searchFields.map((field) => ({ [field]: searchRegex })),
    };
  }

  // Calculate pagination values
  const skip = (currentPage - 1) * perPage;
  const sortObj: { [key: string]: SortOrder } = {
    [sort]: order === "asc" ? 1 : -1,
  };

  // Execute queries in parallel for better performance
  const [total, data] = await Promise.all([
    model.countDocuments(finalQuery),
    model
      .find(finalQuery)
      .sort(sortObj)
      .skip(skip)
      .limit(perPage)
      .lean()
      .exec(),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return {
    data: data as T[],
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
}

/**
 * Helper function to extract pagination options from URL search params
 * @param searchParams - URLSearchParams from Next.js request
 * @returns Pagination options with defaults
 */
export function getPaginationOptions(
  searchParams: URLSearchParams
): PaginationQueryOptions {
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const sort = searchParams.get("sort") || "createdAt";
  const order = (searchParams.get("order") || "desc") as "asc" | "desc";
  const search = searchParams.get("search") || undefined;
  const searchFields = searchParams.get("searchFields")
    ? searchParams.get("searchFields")!.split(",")
    : [];

  return {
    page,
    limit,
    sort,
    order,
    search,
    searchFields,
  };
}

/**
 * Helper function to create pagination response format
 * @param data - Paginated data
 * @param pagination - Pagination metadata
 * @param message - Success message
 * @returns Formatted response object
 */
export function createPaginationResponse<T>(
  data: T[],
  pagination: PaginationResult<T>["pagination"],
  message: string = "Data fetched successfully"
): ResponseInterface<{
  items: T[];
  pagination: PaginationResult<T>["pagination"];
}> {
  return {
    data: {
      items: data,
      pagination,
    },
    message,
    status: true,
  };
}

/**
 * Client-side pagination helper for arrays
 * @param array - Array to paginate
 * @param page - Current page
 * @param limit - Items per page
 * @returns Paginated array with metadata
 */
export function paginateArray<T>(
  array: T[],
  page: number = 1,
  limit: number = 10
): PaginationResult<T> {
  const currentPage = Math.max(1, page);
  const perPage = Math.max(1, limit);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedItems = array.slice(startIndex, endIndex);
  const total = array.length;
  const totalPages = Math.ceil(total / perPage);

  return {
    data: paginatedItems,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
}
