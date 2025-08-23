import connect from "@/lib/db";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Course } from "@/models/Course";
import { IUser } from "@/models/User";
import { VideoProgress } from "@/models/VideoProgress";
import { Roles } from "@/types/constants";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

export const getController = async (
  req: NextRequest,
  { admin, user }: { admin?: Admin; user?: IUser }
) => {
  try {
    await connect();

    const searchParams = req.nextUrl.searchParams;
    const options = getPaginationOptions(searchParams);

    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const purchasedCourses = user?.purchasedCourses || [];

    if (!purchasedCourses.length) {
      return response.paginatedResponse(
        createPaginationResponse(
          [],
          {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          "Courses fetched successfully"
        ),
        200
      );
    }

    const purchasedCourseIds = purchasedCourses.map(
      (course: any) => course.courseId
    );

    let filter: Record<string, any> = {
      _id: { $in: purchasedCourseIds },
    };

    if (search) {
      filter = {
        $and: [
          { _id: { $in: purchasedCourseIds } },
          {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
            ],
          },
        ],
      };
    }

    const result = await paginate(Course, filter, {
      ...options,
      sort: sortObj,
      populate: "courseVideos",
      computeFields: {
        isPurchased: () => true,
      },
    });

    const coursesWithProgress = await Promise.all(
      result.data.map(async (course: any) => {
        const courseProgress = await VideoProgress.getCourseProgress(
          user?._id as Types.ObjectId,
          course._id
        );
        return {
          ...course,
          progress: courseProgress,
        };
      })
    );

    const data = createPaginationResponse(
      coursesWithProgress,
      result.pagination,
      "Courses fetched successfully"
    );

    return response.paginatedResponse(data, 200);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const GET = async (req: NextRequest) =>
  authMiddleware(req, [Roles.user], getController);
