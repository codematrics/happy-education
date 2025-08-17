import { processFilesAndReturnUpdatedResults } from "@/lib/cloudinary";
import connect from "@/lib/db";
import { formDataToJson } from "@/lib/formDataParser";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { validateSchema } from "@/lib/schemaValidator";
import { Course } from "@/models/Course";
import { User } from "@/models/User";
import { courseValidations, CourseVideoFormData } from "@/types/schema";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    const searchParams = req.nextUrl.searchParams;
    const options = getPaginationOptions(searchParams);

    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let userId = searchParams.get("userId");
    // const isIncludePurchased = searchParams.get("isIncludePurchased");

    const userToken = (await cookies()).get("user_token")?.value;
    const excludePurchased = searchParams.get("excludePurchased");
    
    // Check if user is authenticated
    let authenticatedUserId = null;
    if (userToken) {
      try {
        let parsedToken;
        try {
          parsedToken = JSON.parse(userToken);
        } catch {
          parsedToken = userToken;
        }
        
        if (await verifyJWT(parsedToken)) {
          const decodedToken = await decodeJWT(parsedToken);
          authenticatedUserId = decodedToken._id;
          if (!userId) userId = authenticatedUserId;
        }
      } catch (error) {
        console.log("Token verification failed:", error);
      }
    }

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get purchased courses for authenticated user
    const purchasedCourses = authenticatedUserId
      ? (await User.findOne({ _id: authenticatedUserId }))?.purchasedCourses || []
      : [];

    // If excluding purchased courses, filter them out
    if (authenticatedUserId && excludePurchased) {
      filter = {
        ...filter,
        _id: { $nin: purchasedCourses?.map((c: any) => c._id) || [] },
      };
    }

    // Always include isPurchased field for consistency
    const result = await paginate(Course, filter, {
      ...options,
      sort: sortObj,
      populate: "courseVideos",
      computeFields: {
        isPurchased: (course: { _id: { toString: () => string } }) => 
          authenticatedUserId 
            ? purchasedCourses.some((pc: { toString: () => string }) => pc.toString() === course._id.toString())
            : false,
      },
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
