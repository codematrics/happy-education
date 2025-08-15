import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICourseVideo extends Document {
  name: string;
  description: string;
  thumbnail: string;
  video: string;
  createdAt: Date;
}

const CourseVideoSchema: Schema<ICourseVideo> = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  video: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const CourseVideo: Model<ICourseVideo> =
  mongoose.models.CourseVideo ||
  mongoose.model<ICourseVideo>("CourseVideo", CourseVideoSchema);
