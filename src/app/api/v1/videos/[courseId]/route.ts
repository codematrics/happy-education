import connect from "@/lib/db";
import { validateCourseAccess } from "@/lib/courseAccessMiddleware";
import { Course } from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) => {
  try {
    const { courseId } = await params;

    await connect();

    // Validate course access using middleware
    const accessValidation = await validateCourseAccess(req, courseId);

    if (!accessValidation.isValid) {
      return accessValidation.response!;
    }

    // Get course with videos
    const course = await Course.findById(courseId).populate("courseVideos");

    if (!course) {
      return NextResponse.json(
        { data: null, message: "Course not found", status: false },
        { status: 404 }
      );
    }

    // Return course data with access information
    return NextResponse.json(
      {
        data: {
          course: {
            id: course._id,
            name: course.name,
            description: course.description,
            benefits: course.benefits,
            thumbnail: course.thumbnail,
            previewVideo: course.previewVideo,
            price: course.price,
            currency: course.currency,
            accessType: course.accessType,
            courseVideos: course.courseVideos,
            createdAt: course.createdAt,
            isPurchased: accessValidation.accessResult?.hasAccess || false,
          },
          accessInfo: {
            hasAccess: accessValidation.accessResult?.hasAccess,
            accessType: accessValidation.accessResult?.accessType,
            expiryDate: accessValidation.accessResult?.expiryDate,
          },
        },
        message: "Course videos fetched successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching course videos:", error);
    return NextResponse.json(
      { data: null, message: "Internal Server Error", status: false },
      { status: 500 }
    );
  }
};
