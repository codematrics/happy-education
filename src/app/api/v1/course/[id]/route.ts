import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { validateSchema } from "@/lib/schemaValidator";
import { authMiddleware } from "@/middlewares/authMiddleware";
import "@/models/Course";
import { Course } from "@/models/Course";
import { Testimonial } from "@/models/Testimonial";
import { IPurchasedCourse, IUser, User } from "@/models/User";
import { Roles } from "@/types/constants";
import { courseUpdateValidations } from "@/types/schema";
import { Admin, Course as TypeOfCourse } from "@/types/types";
import { response } from "@/utils/response";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const getController = async (
  req: NextRequest,
  { id, admin, user }: { id: string; admin?: Admin; user?: IUser }
) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const relatedCourse = searchParams.get("relatedCourse");

    await connect();

    const course = await Course.findById(id).populate("courseVideos").lean();

    if (!course) {
      return response.error("Course Not Found", 404);
    }

    let isPurchased = false;

    if (user) {
      isPurchased =
        user?.purchasedCourses?.some(
          (pc: IPurchasedCourse) => pc.courseId.toString() === id
        ) || false;
    }

    const testimonials = await Testimonial.find({
      courseId: { $in: [id] },
    }).populate("courseId");

    let result: TypeOfCourse = {
      ...course,
      testimonials: testimonials,
      isPurchased: isPurchased,
    } as unknown as TypeOfCourse;

    if (relatedCourse) {
      const relatedCoursesData = await Course.find({ _id: { $ne: id } }).limit(
        4
      );

      const relatedCoursesWithPurchaseStatus = relatedCoursesData.map(
        (relatedCourse) => ({
          ...relatedCourse.toObject(),
          isPurchased: user
            ? user?.purchasedCourses?.some(
                (pc: IPurchasedCourse) =>
                  pc.courseId?.toString() ===
                  (relatedCourse._id as { toString: () => string }).toString()
              ) || false
            : false,
        })
      );

      result = {
        ...result,
        relatedCourse: relatedCoursesWithPurchaseStatus,
      } as unknown as TypeOfCourse;
    }

    return response.success(result, "Course fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching course:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const putController = async (
  req: NextRequest,
  { id, admin, user }: { id: string; admin?: Admin; user?: IUser }
) => {
  try {
    const json = await req.json();

    validateSchema(courseUpdateValidations, json);

    await connect();

    const existingCourse = await Course.findById(id)
      .populate("courseVideos")
      .lean();

    if (!existingCourse) {
      return response.error("Course Not Found", 404);
    }

    const finalResults = {
      ...json,
      courseVideos: json.courseVideos || [],
    };

    const updatedCourse = await Course.updateWithVideos(id, finalResults);

    if (!updatedCourse) {
      return response.error("Course Not Found", 404);
    }

    return response.success(updatedCourse, "Course Updated Successfully", 200);
  } catch (error) {
    console.error("Error updating course:", error);
    return response.error("Internal server error", 500);
  }
};

export const deleteController = async (
  req: NextRequest,
  { id, admin, user }: { id: string; admin?: Admin; user?: IUser }
) => {
  try {
    await connect();

    const deletedCourse = await Course.deleteWithVideos(id);

    if (!deletedCourse) {
      return response.error("Course Not Found", 404);
    }

    return response.success(null, "Course deleted successfully", 200);
  } catch (error) {
    console.error("Error deleting course:", error);
    return response.error("Internal server error", 500);
  }
};

export const DELETE = (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) =>
  authMiddleware(
    req,
    [Roles.admin],
    async (
      r: NextRequest,
      context: {
        user?: IUser;
        admin?: Admin;
      }
    ) => {
      const { id } = await params;
      if (!id) {
        return NextResponse.json(
          { error: "Please provide a valid courseId" },
          { status: 400 }
        );
      }
      return await deleteController(r, {
        id,
        admin: context?.admin,
        user: context?.user,
      });
    }
  );

export const PUT = (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) =>
  authMiddleware(
    req,
    [Roles.admin],
    async (
      r: NextRequest,
      context: {
        user?: IUser;
        admin?: Admin;
      }
    ) => {
      const { id } = await params;
      if (!id) {
        return NextResponse.json(
          { error: "Please provide a valid courseId" },
          { status: 400 }
        );
      }
      return await putController(r, {
        id,
        admin: context?.admin,
        user: context?.user,
      });
    }
  );

export const GET = (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) =>
  authMiddleware(
    req,
    [],
    async (
      r: NextRequest,
      context: {
        user?: IUser;
        admin?: Admin;
      }
    ) => {
      const { id } = await params;
      if (!id) {
        return NextResponse.json(
          { error: "Please provide a valid courseId" },
          { status: 400 }
        );
      }
      return await getController(r, {
        id,
        admin: context?.admin,
        user: context?.user,
      });
    },
    true
  );
