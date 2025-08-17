import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IVideoProgress extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  videoId: Types.ObjectId;
  isCompleted: boolean;
  watchTime: number; // in seconds
  totalDuration: number; // in seconds
  lastWatchedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VideoProgressSchema: Schema<IVideoProgress> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "CourseVideo",
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    watchTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDuration: {
      type: Number,
      required: true,
      min: 0,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one progress record per user per video
VideoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

// Index for efficient course progress queries
VideoProgressSchema.index({ userId: 1, courseId: 1 });

// Method to calculate completion percentage
VideoProgressSchema.methods.getCompletionPercentage = function (): number {
  if (this.totalDuration === 0) return 0;
  return Math.min(100, Math.round((this.watchTime / this.totalDuration) * 100));
};

// Static method to get course progress for a user
VideoProgressSchema.statics.getCourseProgress = async function (
  userId: Types.ObjectId,
  courseId: Types.ObjectId
) {
  try {
    // Import mongoose to get the Course model
    const mongoose = await import("mongoose");
    
    // Get the actual course to count total videos
    const course = await mongoose.default.model("Course").findById(courseId).populate("courseVideos");
    
    console.log("Course found:", !!course);
    console.log("Course videos:", course?.courseVideos?.length);
    
    if (!course) {
      console.log("No course found for ID:", courseId);
      return {
        totalVideos: 0,
        completedVideos: 0,
        progressPercentage: 0,
      };
    }

    const totalVideos = course.courseVideos ? course.courseVideos.length : 0;
    console.log("Total videos in course:", totalVideos);
    
    if (totalVideos === 0) {
      console.log("No videos in course");
      return {
        totalVideos: 0,
        completedVideos: 0,
        progressPercentage: 0,
      };
    }

    // Get user's progress for this course
    const progress = await this.find({ userId, courseId });
    const completedVideos = progress.filter((p: IVideoProgress) => p.isCompleted).length;
    const progressPercentage = Math.round((completedVideos / totalVideos) * 100);

    console.log("Progress calculation:", {
      totalVideos,
      completedVideos,
      progressPercentage,
      progressRecords: progress.length
    });

    return {
      totalVideos,
      completedVideos,
      progressPercentage,
    };
  } catch (error) {
    console.error("Error in getCourseProgress:", error);
    return {
      totalVideos: 0,
      completedVideos: 0,
      progressPercentage: 0,
    };
  }
};

export interface IVideoProgressModel extends Model<IVideoProgress> {
  getCourseProgress(
    userId: Types.ObjectId,
    courseId: Types.ObjectId
  ): Promise<{
    totalVideos: number;
    completedVideos: number;
    progressPercentage: number;
  }>;
}

export const VideoProgress: IVideoProgressModel =
  (mongoose.models.VideoProgress as IVideoProgressModel) ||
  mongoose.model<IVideoProgress, IVideoProgressModel>("VideoProgress", VideoProgressSchema);