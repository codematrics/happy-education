import connect from "@/lib/db";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { validateSchema } from "@/lib/schemaValidator";
import { Inquiry } from "@/models/Inquiry";
import { inquirySchema } from "@/types/schema";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    const searchParams = req.nextUrl.searchParams;
    const options = getPaginationOptions(searchParams);

    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { phone: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
        ],
      };
    }

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const result = await paginate(Inquiry, filter, {
      ...options,
      sort: sortObj,
    });

    const data = createPaginationResponse(
      result.data,
      result.pagination,
      "Inquiries fetched successfully"
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
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

export const POST = async (req: NextRequest) => {
  try {
    const json = await req.json();

    validateSchema(inquirySchema, json);

    await connect();

    const newCourse = await Inquiry.create(json);

    return NextResponse.json(
      {
        data: newCourse,
        message: "Inquiry sent successfully",
        status: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating inquiry:", error);

    if (error instanceof Error && error.message.includes("Validation failed")) {
      return NextResponse.json(
        {
          data: null,
          message: "Validation failed",
          status: false,
          errors: error.message,
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      (error.message.includes("Invalid file type") ||
        error.message.includes("too large") ||
        error.message.includes("Failed to upload"))
    ) {
      return NextResponse.json(
        {
          data: null,
          message: error.message,
          status: false,
        },
        { status: 400 }
      );
    }

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
