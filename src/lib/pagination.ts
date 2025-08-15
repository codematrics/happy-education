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
  sort?: string | Record<string, 1 | -1>;
  order?: "asc" | "desc";
  search?: string;
  searchFields?: string[];
  populate?: string | string[];
  fields?: string | string[]; // select only specific fields
  counts?: string[]; // fields to count distinct values
  combineFields?: { newField: string; fields: string[]; separator?: string }[]; // combine fields into one
  computeFields?: Record<string, (item: any) => any | Promise<any>>; // NEW: compute extra fields
}

/**
 * Generic pagination utility for MongoDB queries
 * @param model - Mongoose model
 * @param query - MongoDB query filter
 * @param options - Pagination options
 * @returns Paginated result with metadata
 */ export async function paginate<T>(
  model: Model<T>,
  query: FilterQuery<T> = {},
  options: PaginationQueryOptions = { page: 1, limit: 10 }
): Promise<PaginationResult<T> & { counts?: Record<string, number> }> {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
    search,
    searchFields = [],
    populate,
    fields,
    counts,
    combineFields = [],
    computeFields = {}, // ✅ NEW
  } = options;

  const currentPage = Math.max(1, page);
  const perPage = Math.max(1, Math.min(limit, 100));

  let finalQuery = { ...query };
  if (search && searchFields.length > 0) {
    const searchRegex = new RegExp(search, "i");
    finalQuery = {
      ...query,
      $or: searchFields.map((field) => ({ [field]: searchRegex })),
    };
  }

  const skip = (currentPage - 1) * perPage;

  let sortObj: { [key: string]: SortOrder };
  if (typeof sort === "string") {
    sortObj = { [sort]: order === "asc" ? 1 : -1 };
  } else {
    sortObj = sort as { [key: string]: SortOrder };
  }

  let queryBuilder = model
    .find(finalQuery)
    .sort(sortObj)
    .skip(skip)
    .limit(perPage);

  // Field selection
  if (fields) {
    queryBuilder = queryBuilder.select(
      Array.isArray(fields) ? fields.join(" ") : fields
    );
  }

  // Populate
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((field) => {
        queryBuilder = queryBuilder.populate(field);
      });
    } else {
      queryBuilder = queryBuilder.populate(populate);
    }
  }

  const [total, data] = await Promise.all([
    model.countDocuments(finalQuery),
    queryBuilder.lean().exec(),
  ]);

  const totalPages = Math.ceil(total / perPage);

  // Add combined fields
  if (combineFields.length > 0) {
    data.forEach((item: any) => {
      combineFields.forEach(({ newField, fields, separator = " " }) => {
        item[newField] = fields
          .map((f) => item[f] ?? "")
          .join(separator)
          .trim();
      });
    });
  }

  // ✅ Add computed fields
  if (computeFields && Object.keys(computeFields).length > 0) {
    data.forEach((item: any) => {
      for (const [fieldName, computeFn] of Object.entries(computeFields)) {
        try {
          item[fieldName] = computeFn(item);
        } catch (err) {
          console.error(`Error computing field "${fieldName}":`, err);
        }
      }
    });
  }

  // Count distinct values if requested
  let countsResult: Record<string, number> | undefined = undefined;
  if (counts && counts.length > 0) {
    countsResult = {};
    for (const field of counts) {
      countsResult[field] = await model
        .distinct(field, finalQuery)
        .then((res) => res.length);
    }
  }

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
    ...(countsResult ? { counts: countsResult } : {}),
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
