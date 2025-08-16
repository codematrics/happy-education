import { deleteFileFromUrl } from "@/lib/cloudinary";
import { Course } from "@/types/types";
import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITestimonial extends Document {
  video: {
    publicId: string;
    url: string;
    duration: number;
    format: string;
    width?: number;
    height?: number;
  };
  thumbnail: {
    publicId: string;
    url: string;
  };
  createdAt: Date;
  courseId: Course[] | Types.ObjectId[];
}

export interface ITestimonialModel extends Model<ITestimonial> {
  deleteWithVideos(testimonialId: string): Promise<ITestimonial | null>;
  updateWithVideos(
    testimonialId: string,
    updateData: Partial<ITestimonial>
  ): Promise<ITestimonial | null>;
}

const TestimonialSchema: Schema<ITestimonial> = new Schema({
  video: {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    duration: { type: Number, required: true },
    format: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  thumbnail: {
    publicId: { type: String, default: null },
    url: {
      type: String,
      default: null,
    },
  },
  courseId: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

TestimonialSchema.statics.deleteWithVideos = async function (
  testimonialId: string
) {
  const existingCourse = await this.findById(testimonialId).populate(
    "courseId"
  );
  if (!existingCourse) {
    throw new Error("Testimonial not found");
  }

  if (existingCourse.thumbnail) {
    await deleteFileFromUrl(existingCourse.thumbnail);
  }
  if (existingCourse.video) {
    await deleteFileFromUrl(existingCourse.video);
  }

  const deletedTestimonial = await this.findByIdAndDelete(testimonialId).lean();

  return deletedTestimonial;
};

TestimonialSchema.statics.updateWithVideos = async function (
  testimonialId: string,
  updateData: Partial<ITestimonial>
) {
  const existingTestimonial = await this.findById(testimonialId);
  if (!existingTestimonial) {
    throw new Error("Testimonial not found");
  }

  // Handle file cleanup for updated assets
  if (
    updateData.thumbnail &&
    updateData.thumbnail.publicId !== existingTestimonial.thumbnail?.publicId
  ) {
    if (existingTestimonial.thumbnail) {
      await deleteFileFromUrl(existingTestimonial.thumbnail);
    }
  }

  if (
    updateData.video &&
    updateData.video.publicId !== existingTestimonial.video?.publicId
  ) {
    if (existingTestimonial.video) {
      await deleteFileFromUrl(existingTestimonial.video);
    }
  }

  const updatedTestimonial = await this.findByIdAndUpdate(
    testimonialId,
    updateData,
    { new: true, runValidators: true }
  );

  return updatedTestimonial;
};

export const Testimonial: ITestimonialModel =
  (mongoose.models.Testimonial as ITestimonialModel) ||
  mongoose.model<ITestimonial, ITestimonialModel>(
    "Testimonial",
    TestimonialSchema
  );
