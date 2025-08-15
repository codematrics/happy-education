import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { ICourse } from "./Course";
import { ITransaction } from "./Transaction";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  isVerified: boolean;
  otp: string | null;
  password: string;
  otpGenerationTime: Date | null;
  isBlocked: boolean;
  profileImage?: {
    publicId: string | null;
    url: string | null;
  };
  createdAt: Date;
  purchasedCourses: Types.ObjectId[] | ICourse[];
  transactions: Types.ObjectId[] | ITransaction[];
}
const UserSchema: Schema<IUser> = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    sparse: true,
    set: (v: string) => (v?.trim() === "" ? null : v),
  },
  otp: { type: String, default: null },
  otpGenerationTime: { type: Date, default: null },
  mobileNumber: {
    type: String,
    unique: true,
    sparse: true,
    set: (v: string) => (v?.trim() === "" ? null : v),
  },
  isVerified: { type: Boolean, default: false },
  password: { type: String, required: true },
  profileImage: {
    type: {
      publicId: { type: String, default: null },
      url: { type: String, default: null },
    },
    default: null,
  },
  isBlocked: { type: Boolean, default: false },
  purchasedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre("validate", function (next) {
  if (!this.email && !this.mobileNumber) {
    next(new Error("Either email or mobile number is required"));
  } else {
    next();
  }
});

export interface IUserModel extends Model<IUser> {}

export const User: IUserModel =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser, IUserModel>("User", UserSchema);
