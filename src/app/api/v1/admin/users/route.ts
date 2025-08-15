import connect from "@/lib/db";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    const searchParams = req.nextUrl.searchParams;
    const options = getPaginationOptions(searchParams);

    // Get search and sort parameters
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build search filter
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobileNumber: { $regex: search, $options: "i" } },
        ],
      };
    }

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const result = await paginate(User, filter, {
      ...options,
      sort: sortObj,
      fields: [
        "firstName",
        "lastName",
        "email",
        "mobileNumber",
        "createdAt",
        "isVerified",
        "isBlocked",
        "purchasedCourses",
      ],
      computeFields: {
        fullName: (item) => `${item.firstName} ${item.lastName}`,
        purchasedCount: (item) => item.purchasedCourses.length,
      },
    });

    const data = createPaginationResponse(
      result.data,
      result.pagination,
      "Users fetched successfully"
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        data: null,
        message: "Internal Server Error",
        status: false,
      },
      { status: 500 }
    );
  }
};
