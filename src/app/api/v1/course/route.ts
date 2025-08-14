import connect from "@/lib/db";
import { parseFormDataToJson } from "@/lib/formDataParser";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { Course } from "@/models/Course";
import { courseValidations } from "@/types/schema";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    const searchParams = req.nextUrl.searchParams;
    const options = getPaginationOptions(searchParams);

    const result = await paginate(Course, {}, options);

    const data = createPaginationResponse(
      result.data,
      result.pagination,
      "Courses fetched successfully"
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
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
    const formData = await req.formData();
    
    // Parse and validate data (validation happens before file upload)
    const parsedData = await parseFormDataToJson(formData, courseValidations);

    // Final validation with Zod schema
    const validation = courseValidations.safeParse(parsedData);
    if (!validation.success) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid input",
          status: false,
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await connect();

    const newCourse = await Course.create(validation.data);

    return NextResponse.json(
      {
        data: newCourse,
        message: "Course created successfully",
        status: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    
    // Check if it's a validation error from formDataParser
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

    // Check if it's a file upload error
    if (error instanceof Error && (
      error.message.includes("Invalid file type") ||
      error.message.includes("too large") ||
      error.message.includes("Failed to upload")
    )) {
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
