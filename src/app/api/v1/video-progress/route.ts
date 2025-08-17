import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { Course } from "@/models/Course";
import { VideoProgress } from "@/models/VideoProgress";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connect();

    const userToken = (await cookies()).get("user_token")?.value;

    if (!userToken) {
      return NextResponse.json(
        {
          data: null,
          message: "Unauthorized",
          status: false,
        },
        { status: 401 }
      );
    }

    let parsedToken;
    try {
      parsedToken = JSON.parse(userToken);
    } catch (parseError) {
      parsedToken = userToken;
    }

    if (!(await verifyJWT(parsedToken))) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid token",
          status: false,
        },
        { status: 401 }
      );
    }

    const decodedToken = await decodeJWT(parsedToken);
    const userId = decodedToken._id;

    const body = await req.json();
    const { courseId, videoId, watchTime, totalDuration, isCompleted } = body;

    if (!courseId || !videoId || watchTime === undefined || !totalDuration) {
      return NextResponse.json(
        {
          data: null,
          message: "Missing required fields",
          status: false,
        },
        { status: 400 }
      );
    }

    // Update or create video progress
    const progressData = {
      userId,
      courseId,
      videoId,
      watchTime,
      totalDuration,
      lastWatchedAt: new Date(),
      isCompleted: isCompleted || watchTime >= totalDuration * 0.9, // Auto-complete at 90%
      ...(isCompleted && { completedAt: new Date() }),
    };

    const progress = await VideoProgress.findOneAndUpdate(
      { userId, videoId },
      progressData,
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        data: progress,
        message: "Video progress updated successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating video progress:", error);
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

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    const userToken = (await cookies()).get("user_token")?.value;

    if (!userToken) {
      return NextResponse.json(
        {
          data: null,
          message: "Unauthorized",
          status: false,
        },
        { status: 401 }
      );
    }

    let parsedToken;
    try {
      parsedToken = JSON.parse(userToken);
    } catch (parseError) {
      parsedToken = userToken;
    }

    if (!(await verifyJWT(parsedToken))) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid token",
          status: false,
        },
        { status: 401 }
      );
    }

    const decodedToken = await decodeJWT(parsedToken);
    const userId = decodedToken._id;

    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");
    const videoId = searchParams.get("videoId");

    if (videoId) {
      // Get specific video progress
      const progress = await VideoProgress.findOne({ userId, videoId });
      return NextResponse.json(
        {
          data: progress,
          message: "Video progress fetched successfully",
          status: true,
        },
        { status: 200 }
      );
    }

    if (courseId) {
      // Get the course to count total videos
      const course = await Course.findById(courseId).populate("courseVideos");
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

      const totalVideos = course.courseVideos ? course.courseVideos.length : 0;
      
      // Get user's progress for this course
      const videoProgresses = await VideoProgress.find({ userId, courseId });
      const completedVideos = videoProgresses.filter((p) => p.isCompleted).length;
      const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

      const courseProgress = {
        totalVideos,
        completedVideos,
        progressPercentage,
      };

      console.log("Course progress calculation:", {
        courseId,
        totalVideos,
        completedVideos,
        progressPercentage,
        videoProgressRecords: videoProgresses.length
      });

      return NextResponse.json(
        {
          data: {
            courseProgress,
            videoProgresses,
          },
          message: "Course progress fetched successfully",
          status: true,
        },
        { status: 200 }
      );
    }

    // Get all user progress
    const allProgress = await VideoProgress.find({ userId })
      .populate("courseId", "name thumbnail")
      .populate("videoId", "title duration");

    return NextResponse.json(
      {
        data: allProgress,
        message: "User progress fetched successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching video progress:", error);
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
