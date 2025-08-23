import connect from "@/lib/db";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Course, ICourse } from "@/models/Course";
import { IPurchasedCourse, IUser } from "@/models/User";
import { CourseAccessType } from "@/types/constants";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { NextRequest, NextResponse } from "next/server";

export const getController = async (
  req: NextRequest,
  { course, user }: { course: ICourse; user?: IUser }
) => {
  try {
    const isPurchased = user?.purchasedCourses?.find(
      (pc: IPurchasedCourse) =>
        pc.courseId?.toString() === course?._id?.toString()
    );

    console.log(isPurchased);

    if (!isPurchased && course.accessType !== CourseAccessType.free) {
      return response.error("You don't have access to this course", 403);
    }

    if (!course) {
      return response.error("Course Not Found", 404);
    }

    return response.success(
      {
        course,
        accessInfo: {
          hasAccess: true,
          accessType: course.accessType,
          expiryDate: isPurchased?.expiryDate,
        },
      },
      "Course Videos Fetched Successfully",
      200
    );
  } catch (error) {
    console.error("Error fetching course videos:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) => {
  const { courseId } = await params;
  await connect();
  const course = await Course.findOne({ _id: courseId }).populate(
    "courseVideos"
  );

  if (!course) {
    return response.error("Course Not Found", 404);
  }

  return await authMiddleware(
    req,
    [],
    async (
      r: NextRequest,
      context: {
        user?: IUser;
        admin?: Admin;
      }
    ) => {
      const { courseId } = await params;
      if (!courseId) {
        return NextResponse.json(
          { error: "Please provide a valid courseId" },
          { status: 400 }
        );
      }
      return await getController(r, {
        course,
        user: context?.user,
      });
    },
    true
  );
};
