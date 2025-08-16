import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInquiry extends Document {
  firstName: string;
  phone: string;
  createdAt: Date;
  message?: string;
}
const InquirySchema: Schema<IInquiry> = new Schema({
  firstName: { type: String, required: true },
  phone: {
    type: String,
    required: true,
  },
  message: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export interface IInquiryModel extends Model<IInquiry> {}

export const Inquiry: IInquiryModel =
  (mongoose.models.Inquiry as IInquiryModel) ||
  mongoose.model<IInquiry, IInquiryModel>("Inquiry", InquirySchema);
