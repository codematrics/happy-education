import connect from "@/lib/db";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Course } from "@/models/Course";
import { IUser } from "@/models/User";
import { VideoProgress } from "@/models/VideoProgress";
import { Roles } from "@/types/constants";
import { response } from "@/utils/response";
import { NextRequest } from "next/server";

const postController = async (req: NextRequest, { user }: { user?: IUser }) => {
  try {
    await connect();

    const userId = user?._id;

    const body = await req.json();
    const { courseId, videoId, watchTime, totalDuration, isCompleted } = body;

    if (!courseId || !videoId || watchTime === undefined || !totalDuration) {
      return response.error("Invalid request", 400);
    }

    const progressData = {
      userId,
      courseId,
      videoId,
      watchTime,
      totalDuration,
      lastWatchedAt: new Date(),
      isCompleted: isCompleted || watchTime >= totalDuration * 0.9,
      ...(isCompleted && { completedAt: new Date() }),
    };

    const progress = await VideoProgress.findOneAndUpdate(
      { userId, videoId },
      progressData,
      { upsert: true, new: true }
    );

    return response.success(
      progress,
      "Video progress updated successfully",
      200
    );
  } catch (error) {
    console.error("Error updating video progress:", error);
    return response.error("Internal Server Error", 500);
  }
};

const getController = async (req: NextRequest, { user }: { user?: IUser }) => {
  try {
    await connect();

    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");
    const videoId = searchParams.get("videoId");

    if (videoId) {
      const progress = await VideoProgress.findOne({
        userId: user?._id,
        videoId,
      });

      return response.success(
        progress,
        "Video progress fetched successfully",
        200
      );
    }

    if (courseId) {
      const course = await Course.findById(courseId).populate("courseVideos");
      if (!course) {
        return response.error("Course not found", 404);
      }

      const totalVideos = course.courseVideos ? course.courseVideos.length : 0;

      const videoProgresses = await VideoProgress.find({
        userId: user?._id,
        courseId,
      });
      const completedVideos = videoProgresses.filter(
        (p) => p.isCompleted
      ).length;
      const progressPercentage =
        totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

      const courseProgress = {
        totalVideos,
        completedVideos,
        progressPercentage,
      };
      return response.success(
        { courseProgress, videoProgresses },
        "Course Progress fetched successfully",
        200
      );
    }

    const allProgress = await VideoProgress.find({ userId: user?._id })
      .populate("courseId", "name thumbnail")
      .populate("videoId", "title duration");

    return response.success(
      allProgress,
      "User Progrss fetched successfully",
      200
    );
  } catch (error) {
    console.error("Error fetching video progress:", error);
    return response.error("Internal Server Error", 404);
  }
};

export const GET = async (req: NextRequest) =>
  await authMiddleware(req, [Roles.user], getController);

export const POST = async (req: NextRequest) =>
  await authMiddleware(req, [Roles.user], postController);
