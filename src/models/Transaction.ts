import { CourseCurrency, TransactionStatus } from "@/types/constants";
import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITransaction extends Document {
  orderId: string;
  transactionId: string;
  courseId: Types.ObjectId;
  currency: CourseCurrency;
  amount: number;
  createdAt: Date;
  status: TransactionStatus;
}

const TransactionSchema: Schema<ITransaction> = new Schema({
  orderId: { type: String, required: true },
  transactionId: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  currency: {
    type: String,
    enum: CourseCurrency,
    required: true,
  },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.pending,
  },
});

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
