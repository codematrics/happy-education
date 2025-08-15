import { processFilesAndReturnUpdatedResults } from "@/lib/cloudinary";
import connect from "@/lib/db";
import { formDataToJson } from "@/lib/formDataParser";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { validateSchema } from "@/lib/schemaValidator";
import { Course } from "@/models/Course";
import { courseValidations, CourseVideoFormData } from "@/types/schema";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    const searchParams = req.nextUrl.searchParams;
    const options = getPaginationOptions(searchParams);
    
    // Get search and sort parameters
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build search filter
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const result = await paginate(Course, filter, {
      ...options,
      sort: sortObj,
      populate: 'courseVideos'
    });

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
    const json = formDataToJson(formData);

    validateSchema(courseValidations, json);

    const fileUploadResults = await processFilesAndReturnUpdatedResults(
      ["thumbnail", "previewVideo"],
      json,
      "courses"
    );

    const finalResults = {
      ...fileUploadResults,
      courseVideos: json.courseVideos
        ? await Promise.all(
            json.courseVideos.map(async (video: CourseVideoFormData) => {
              const uploadResult = await processFilesAndReturnUpdatedResults(
                ["thumbnail", "video"],
                video,
                "course_videos"
              );
              return uploadResult;
            })
          )
        : [],
    };

    await connect();

    const newCourse = await Course.createWithVideos(finalResults);

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
