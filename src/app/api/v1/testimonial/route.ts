import connect from "@/lib/db";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { validateSchema } from "@/lib/schemaValidator";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Course } from "@/models/Course";
import { Testimonial } from "@/models/Testimonial";
import { IPurchasedCourse, IUser } from "@/models/User";
import { Roles } from "@/types/constants";
import { testimonialCreateSchema } from "@/types/schema";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { NextRequest } from "next/server";

const postController = async (req: NextRequest) => {
  try {
    const json = await req.json();

    validateSchema(testimonialCreateSchema, json);

    await connect();

    if (json.courseId && json.courseId.length > 0) {
      const courses = await Course.find({ _id: { $in: json.courseId } });

      if (courses.length !== json.courseId.length) {
        return response.error("Course Not Found", 404);
      }
    }

    const testimonial = await Testimonial.create(json);
    return response.success(
      testimonial,
      "Testimonial created successfully",
      201
    );
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return response.error("Internal Server error", 500);
  }
};

const getController = async (
  req: NextRequest,
  { admin, user }: { user?: IUser; admin?: Admin }
) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const options = getPaginationOptions(searchParams);

    const courseId = searchParams.get("courseId") || "";
    await connect();

    let purchasedCourses: IPurchasedCourse[] = user?.purchasedCourses || [];

    if (courseId) {
      const course = await Course.findOne({ _id: courseId });

      if (!course) {
        return response.error("Course Not Found", 404);
      }

      const filter = {
        courseId: courseId,
      };

      const result = await paginate(Testimonial, filter, {
        ...options,
        populate: "courseId",
        computeFields: {
          isPurchased: (testimonial: any) => {
            if (!user || !testimonial.courseId) return false;
            return purchasedCourses.some(
              (pc: any) =>
                pc.courseId?.toString() === testimonial.courseId._id?.toString()
            );
          },
        },
      });

      const data = createPaginationResponse(
        result.data,
        result.pagination,
        "Testimonials fetched successfully"
      );

      return response.success(data, "Testimonial Fetched Successfully", 200);
    }

    const result = await paginate(
      Testimonial,
      {},
      {
        ...options,
        populate: "courseId",
        computeFields: {
          isPurchased: (testimonial: any) => {
            if (!user || !testimonial.courseId) return false;
            return purchasedCourses.some(
              (pc: any) =>
                pc.courseId?.toString() === testimonial.courseId._id?.toString()
            );
          },
        },
      }
    );

    const data = createPaginationResponse(
      result.data,
      result.pagination,
      "Testimonials fetched successfully"
    );

    return response.paginatedResponse(data, 200);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const POST = async (req: NextRequest) =>
  authMiddleware(req, [Roles.admin], postController);

export const GET = async (req: NextRequest) =>
  authMiddleware(req, [], getController, true);
