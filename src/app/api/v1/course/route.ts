import connect from "@/lib/db";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { validateSchema } from "@/lib/schemaValidator";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Course } from "@/models/Course";
import { IPurchasedCourse, IUser } from "@/models/User";
import { Roles } from "@/types/constants";
import { courseValidations } from "@/types/schema";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { NextRequest } from "next/server";

const getController = async (req: NextRequest, { user }: { user?: IUser }) => {
  try {
    await connect();

    const searchParams = req.nextUrl.searchParams;
    const options = getPaginationOptions(searchParams);

    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const excludePurchased = searchParams.get("excludePurchased");

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

    const purchasedCourses = user ? user?.purchasedCourses || [] : [];

    if (user && excludePurchased) {
      filter = {
        ...filter,
        _id: { $nin: purchasedCourses?.map((c: any) => c.courseId) || [] },
      };
    }

    const result = await paginate(Course, filter, {
      ...options,
      sort: sortObj,
      populate: "courseVideos",
      computeFields: {
        isPurchased: (course: { _id: { toString: () => string } }) =>
          user
            ? purchasedCourses.some(
                (pc: IPurchasedCourse) =>
                  pc.courseId.toString() === course._id.toString()
              )
            : false,
      },
    });

    const data = createPaginationResponse(
      result.data,
      result.pagination,
      "Courses fetched successfully"
    );

    return response.paginatedResponse(data, 200);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return response.error("Please Reload the site!", 500);
  }
};

const postController = async (
  req: NextRequest,
  { admin }: { admin?: Admin }
) => {
  try {
    const json = await req.json();

    validateSchema(courseValidations, json);

    const finalResults = {
      ...json,
      courseVideos: json.courseVideos || [],
    };

    await connect();

    const newCourse = await Course.createWithVideos(finalResults);

    return response.success(newCourse, "Course Created Successfully", 201);
  } catch (error) {
    console.error("Error creating course:", error);
    return response.error("Something went wrong", 500);
  }
};

export const POST = async (req: NextRequest) =>
  await authMiddleware(req, [Roles.admin], postController);
export const GET = async (req: NextRequest) =>
  await authMiddleware(req, [], getController, true);
