import { processFilesAndReturnUpdatedResults } from "@/lib/cloudinary";
import connect from "@/lib/db";
import { formDataToJson } from "@/lib/formDataParser";
import { validateSchema } from "@/lib/schemaValidator";
import { Course } from "@/models/Course";
import "@/models/CourseVideo";
import { CourseVideoFormData, courseUpdateValidations } from "@/types/schema";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          data: null,
          message: "Course ID is required",
          status: false,
        },
        { status: 400 }
      );
    }

    await connect();

    const course = await Course.findById(id).populate("courseVideos").lean();

    if (!course) {
      return NextResponse.json(
        {
          data: null,
          message: "Course not found",
          status: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: course,
        message: "Course fetched successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching course:", error);
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

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          data: null,
          message: "Course ID is required",
          status: false,
        },
        { status: 400 }
      );
    }
    const formData = await req.formData();
    const json = formDataToJson(formData);

    validateSchema(courseUpdateValidations, json);

    // Get existing course data to preserve asset structures
    await connect();
    const existingCourse = await Course.findById(id)
      .populate("courseVideos")
      .lean();

    if (!existingCourse) {
      return NextResponse.json(
        {
          data: null,
          message: "Course not found",
          status: false,
        },
        { status: 404 }
      );
    }

    const fileUploadResults = await processFilesAndReturnUpdatedResults(
      ["thumbnail", "previewVideo"],
      json,
      "courses",
      existingCourse
    );

    const finalResults = {
      ...fileUploadResults,
      courseVideos: json.courseVideos
        ? await Promise.all(
            json.courseVideos.map(
              async (video: CourseVideoFormData, index: number) => {
                const existingVideos =
                  (existingCourse.courseVideos as any[]) || [];
                const existingVideo = video._id
                  ? existingVideos.find((v) => v._id.toString() === video._id)
                  : null;

                const uploadResult = await processFilesAndReturnUpdatedResults(
                  ["thumbnail", "video"],
                  video,
                  "course_videos",
                  existingVideo
                );
                return uploadResult;
              }
            )
          )
        : [],
    };

    const updatedCourse = await Course.updateWithVideos(id, finalResults);

    if (!updatedCourse) {
      return NextResponse.json(
        {
          data: null,
          message: "Course not found",
          status: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: updatedCourse,
        message: "Course updated successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating course:", error);

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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          data: null,
          message: "Course ID is required",
          status: false,
        },
        { status: 400 }
      );
    }

    await connect();

    const deletedCourse = await Course.deleteWithVideos(id);

    if (!deletedCourse) {
      return NextResponse.json(
        {
          data: null,
          message: "Course not found",
          status: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: deletedCourse,
        message: "Course deleted successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course:", error);
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
