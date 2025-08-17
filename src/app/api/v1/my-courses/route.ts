import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { Course } from "@/models/Course";
import { User } from "@/models/User";
import { VideoProgress } from "@/models/VideoProgress";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const userToken = (await cookies()).get("user_token")?.value;
    console.log("Raw user token:", userToken);
    
    if (!userToken) {
      console.log("No user token found");
      return NextResponse.json(
        {
          data: null,
          message: "No authentication token found",
          status: false,
        },
        { status: 401 }
      );
    }

    let parsedToken;
    try {
      parsedToken = JSON.parse(userToken);
      console.log("Parsed token:", parsedToken);
    } catch (parseError) {
      console.log("Token parse error:", parseError);
      // If token is already a string (not JSON), use it directly
      parsedToken = userToken;
    }

    const isTokenValid = await verifyJWT(parsedToken);
    console.log("Token valid:", isTokenValid);
    
    if (isTokenValid) {
      const decodedToken = await decodeJWT(parsedToken);
      console.log("Decoded token:", decodedToken);
      const userId = decodedToken._id;
      console.log("User ID:", userId);
      await connect();

      const searchParams = req.nextUrl.searchParams;
      const options = getPaginationOptions(searchParams);

      const search = searchParams.get("search") || "";
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = searchParams.get("sortOrder") || "desc";

      const sortObj: Record<string, 1 | -1> = {};
      sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

      const user = await User.findOne({ _id: userId }).populate("purchasedCourses");
      console.log("Found user:", user ? "Yes" : "No");
      console.log("User purchased courses:", user?.purchasedCourses);
      
      const purchasedCourses = user?.purchasedCourses || [];
      console.log("Purchased courses length:", purchasedCourses.length);
      
      if (!purchasedCourses.length) {
        console.log("No purchased courses found for user");
        return NextResponse.json({
          data: {
            items: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalCount: 0,
              hasNextPage: false,
              hasPrevPage: false,
            }
          },
          message: "No purchased courses found",
          status: true,
        }, { status: 200 });
      }

      const purchasedCourseIds = purchasedCourses.map((course: any) => course._id);
      console.log("Purchased course IDs:", purchasedCourseIds);

      let filter: any = {
        _id: { $in: purchasedCourseIds }
      };
      console.log("Filter:", filter);

      if (search) {
        filter = {
          $and: [
            { _id: { $in: purchasedCourseIds } },
            {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
              ],
            }
          ],
        };
      }

      let result = await paginate(Course, filter, {
        ...options,
        sort: sortObj,
        populate: "courseVideos",
        computeFields: {
          isPurchased: () => true,
        },
      });

      console.log("Paginated result:", result);
      console.log("Found courses count:", result.data.length);

      // Add progress data to each course
      const coursesWithProgress = await Promise.all(
        result.data.map(async (course: any) => {
          const courseProgress = await VideoProgress.getCourseProgress(userId, course._id);
          return {
            ...course.toObject(),
            progress: courseProgress,
          };
        })
      );

      const data = createPaginationResponse(
        coursesWithProgress,
        result.pagination,
        "Courses fetched successfully"
      );

      return NextResponse.json(data, { status: 200 });
    } else {
      console.log("Token verification failed");
      return NextResponse.json(
        {
          data: null,
          message: "Login First",
          status: false,
        },
        { status: 401 }
      );
    }
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
