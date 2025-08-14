import { CourseCurrency } from "@/types/constants";
import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { ICourseVideo } from "./CourseVideo";

export interface ICourse extends Document {
  name: string;
  description: string;
  thumbnail: string;
  previewVideoUrl: string;
  price: number;
  currency: "dollar" | "rupee";
  createdAt: Date;
  courseVideos?: Types.ObjectId[] | ICourseVideo[];
}

const CourseSchema: Schema<ICourse> = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  previewVideoUrl: { type: String, required: true },
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

export const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
