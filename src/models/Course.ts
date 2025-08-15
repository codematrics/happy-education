import { areAssetsDifferent } from "@/lib/assetUtils";
import { deleteFileFromUrl } from "@/lib/cloudinary";
import { CourseCurrency } from "@/types/constants";
import { CourseVideoFormData } from "@/types/schema";
import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { CourseVideo, ICourseVideo } from "./CourseVideo";

export interface ICourse extends Document {
  name: string;
  description: string;
  thumbnail: {
    publicId: string;
    url: string;
  };
  previewVideo?: {
    publicId: string;
    url: string;
    duration: number;
    format: string;
    width?: number;
    height?: number;
  };
  price: number;
  currency: "dollar" | "rupee";
  createdAt: Date;
  courseVideos?: Types.ObjectId[] | ICourseVideo[];
}

export interface ICourseModel extends Model<ICourse> {
  createWithVideos(
    courseData: Partial<ICourse> & { courseVideos?: CourseVideoFormData[] }
  ): Promise<ICourse>;
  updateWithVideos(
    courseId: string,
    courseData: Partial<ICourse> & { courseVideos?: CourseVideoFormData[] }
  ): Promise<ICourse>;
  deleteWithVideos(courseId: string): Promise<ICourse | null>;
}

const CourseSchema: Schema<ICourse> = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
  },
  previewVideo: {
    publicId: { type: String },
    url: { type: String },
    duration: { type: Number },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
  },
  price: { type: Number, required: true },
  currency: {
    type: String,
    enum: CourseCurrency,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  courseVideos: [
    {
      type: Schema.Types.ObjectId,
      ref: "CourseVideo",
    },
  ],
});

CourseSchema.statics.createWithVideos = async function (
  courseData: Partial<ICourse> & { courseVideos?: CourseVideoFormData[] }
) {
  const { courseVideos, ...restCourseData } = courseData;

  if (courseVideos && courseVideos.length > 0) {
    const createdVideos = await Promise.all(
      courseVideos.map(async (video: CourseVideoFormData) => {
        return await CourseVideo.create(video);
      })
    );

    const course = await this.create({
      ...restCourseData,
      courseVideos: createdVideos.map((video) => video._id),
    });

    return await course.populate("courseVideos");
  }

  return await this.create(restCourseData);
};

CourseSchema.statics.updateWithVideos = async function (
  courseId: string,
  courseData: Partial<ICourse> & { courseVideos?: CourseVideoFormData[] }
) {
  const { courseVideos, ...restCourseData } = courseData;

  const existingCourse = await this.findById(courseId).populate("courseVideos");
  if (!existingCourse) {
    throw new Error("Course not found");
  }

  if (
    restCourseData.thumbnail &&
    areAssetsDifferent(existingCourse.thumbnail, restCourseData.thumbnail)
  ) {
    await deleteFileFromUrl(existingCourse.thumbnail);
  }
  if (
    restCourseData.previewVideo &&
    areAssetsDifferent(existingCourse.previewVideo, restCourseData.previewVideo)
  ) {
    await deleteFileFromUrl(existingCourse.previewVideo);
  }

  if (courseVideos && courseVideos.length > 0) {
    const existingVideos =
      (existingCourse.courseVideos as ICourseVideo[]) || [];
    const processedVideoIds: string[] = [];

    for (const videoData of courseVideos) {
      const { _id, ...videoFields } = videoData;

      if (_id) {
        const existingVideo = existingVideos.find(
          (v) => (v._id as Types.ObjectId).toString() === _id
        );
        if (existingVideo) {
          if (
            videoFields.thumbnail &&
            areAssetsDifferent(existingVideo.thumbnail, videoFields.thumbnail)
          ) {
            await deleteFileFromUrl(existingVideo.thumbnail);
          }
          if (
            videoFields.video &&
            areAssetsDifferent(existingVideo.video, videoFields.video)
          ) {
            await deleteFileFromUrl(existingVideo.video);
          }

          await CourseVideo.findByIdAndUpdate(_id, videoFields, {
            runValidators: true,
          });
          processedVideoIds.push(_id);
        } else {
          const newVideo = await CourseVideo.create(videoFields);
          processedVideoIds.push((newVideo._id as Types.ObjectId).toString());
        }
      } else {
        const newVideo = await CourseVideo.create(videoFields);
        processedVideoIds.push((newVideo._id as Types.ObjectId).toString());
      }
    }

    const existingVideoIds = existingVideos.map((v) =>
      (v._id as Types.ObjectId).toString()
    );
    const videosToDelete = existingVideoIds.filter(
      (id) => !processedVideoIds.includes(id)
    );

    if (videosToDelete.length > 0) {
      const videosToDeleteDocs = existingVideos.filter((v) =>
        videosToDelete.includes((v._id as Types.ObjectId).toString())
      );

      for (const video of videosToDeleteDocs) {
        if (video.thumbnail) await deleteFileFromUrl(video.thumbnail);
        if (video.video) await deleteFileFromUrl(video.video);
      }

      await CourseVideo.deleteMany({
        _id: { $in: videosToDelete },
      });
    }

    const updatedCourse = await this.findByIdAndUpdate(
      courseId,
      {
        ...restCourseData,
        courseVideos: processedVideoIds,
      },
      { new: true, runValidators: true }
    );

    return await updatedCourse?.populate("courseVideos");
  } else {
    const existingVideos =
      (existingCourse.courseVideos as ICourseVideo[]) || [];
    if (existingVideos.length > 0) {
      for (const video of existingVideos) {
        if (video.thumbnail) await deleteFileFromUrl(video.thumbnail);
        if (video.video) await deleteFileFromUrl(video.video);
      }

      await CourseVideo.deleteMany({
        _id: { $in: existingVideos.map((v) => v._id as Types.ObjectId) },
      });
    }

    const updatedCourse = await this.findByIdAndUpdate(
      courseId,
      { ...restCourseData, courseVideos: [] },
      { new: true, runValidators: true }
    );

    return await updatedCourse?.populate("courseVideos");
  }
};

CourseSchema.statics.deleteWithVideos = async function (courseId: string) {
  const existingCourse = await this.findById(courseId).populate("courseVideos");
  if (!existingCourse) {
    throw new Error("Course not found");
  }

  if (existingCourse.thumbnail) {
    await deleteFileFromUrl(existingCourse.thumbnail);
  }
  if (existingCourse.previewVideo) {
    await deleteFileFromUrl(existingCourse.previewVideo);
  }

  const existingVideos = (existingCourse.courseVideos as ICourseVideo[]) || [];
  if (existingVideos.length > 0) {
    for (const video of existingVideos) {
      if (video.thumbnail)
        await deleteFileFromUrl(video.thumbnail?.url || video.thumbnail);
      if (video.video) await deleteFileFromUrl(video.video?.url || video.video);
    }

    await CourseVideo.deleteMany({
      _id: { $in: existingVideos.map((v) => v._id as Types.ObjectId) },
    });
  }

  const deletedCourse = await this.findByIdAndDelete(courseId).lean();

  return deletedCourse;
};

export const Course: ICourseModel =
  (mongoose.models.Course as ICourseModel) ||
  mongoose.model<ICourse, ICourseModel>("Course", CourseSchema);
