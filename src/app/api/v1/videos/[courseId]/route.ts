import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { ICourse } from "@/models/Course";
import { User } from "@/models/User";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) => {
  try {
    const { courseId } = await params;
    const userToken = (await cookies()).get("user_token")?.value;

    if (!userToken) {
      return NextResponse.json(
        { data: null, message: "Login first", status: false },
        { status: 401 }
      );
    }

    let parsedToken;
    try {
      parsedToken = JSON.parse(userToken);
    } catch {
      parsedToken = userToken;
    }

    const isTokenValid = await verifyJWT(parsedToken);
    if (!isTokenValid) {
      return NextResponse.json(
        { data: null, message: "Invalid token", status: false },
        { status: 401 }
      );
    }

    const decodedToken = await decodeJWT(parsedToken);
    const userId = decodedToken._id;

    await connect();

    const user = await User.findOne({
      _id: userId,
      purchasedCourses: courseId,
    }).populate({
      path: "purchasedCourses",
      match: { _id: courseId },
      populate: { path: "courseVideos" },
    });

    if (!user || !user.purchasedCourses.length) {
      return NextResponse.json(
        { data: null, message: "Course not purchased", status: false },
        { status: 403 }
      );
    }

    const course = user.purchasedCourses[0] as ICourse;
    return NextResponse.json(
      {
        data: course,
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
