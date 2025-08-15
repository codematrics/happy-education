import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICourseVideo extends Document {
  name: string;
  description: string;
  thumbnail: {
    publicId: string;
    url: string;
  };
  video: {
    publicId: string;
    url: string;
    duration: number;
    format: string;
    width?: number;
    height?: number;
    bitrate?: number;
  };
  createdAt: Date;
}

const CourseVideoSchema: Schema<ICourseVideo> = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
  },
  video: {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    duration: { type: Number, required: true },
    format: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    bitrate: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
});

export const CourseVideo: Model<ICourseVideo> =
  mongoose.models.CourseVideo ||
  mongoose.model<ICourseVideo>("CourseVideo", CourseVideoSchema);
