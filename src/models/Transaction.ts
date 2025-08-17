import { CourseCurrency } from "@/types/constants";
import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  amount: number;
  currency: CourseCurrency;
  paymentId: string;
  orderId: string;
  status: "success" | "failed" | "pending";
  paymentMethod?: string;
  paymentGateway: "razorpay";
  metadata?: Record<string, any>;
  receipt?: {
    publicId: string;
    url: string;
    generatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionModel extends Model<ITransaction> {
  createTransaction(
    transactionData: Partial<ITransaction>
  ): Promise<ITransaction>;
  findByOrderId(orderId: string): Promise<ITransaction | null>;
  findByPaymentId(paymentId: string): Promise<ITransaction | null>;
  getUserTransactions(userId: string): Promise<ITransaction[]>;
  getRevenueStats(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    totalTransactions: number;
    successfulTransactions: number;
  }>;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: CourseCurrency,
      required: true,
    },
    paymentId: {
      type: String,
      default: null,
    },
    orderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      required: true,
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: null,
    },
    paymentGateway: {
      type: String,
      enum: ["razorpay"],
      required: true,
      default: "razorpay",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    receipt: {
      publicId: { type: String },
      url: { type: String },
      generatedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ courseId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ orderId: 1 }, { unique: true });
TransactionSchema.index({ paymentId: 1 }, { unique: true });

// Static methods
TransactionSchema.statics.createTransaction = async function (
  transactionData: Partial<ITransaction>
) {
  return await this.create(transactionData);
};

TransactionSchema.statics.findByOrderId = async function (orderId: string) {
  return await this.findOne({ orderId }).populate(["userId", "courseId"]);
};

TransactionSchema.statics.findByPaymentId = async function (paymentId: string) {
  return await this.findOne({ paymentId }).populate(["userId", "courseId"]);
};

TransactionSchema.statics.getUserTransactions = async function (
  userId: string
) {
  return await this.find({ userId })
    .populate("courseId", "name thumbnail price accessType")
    .sort({ createdAt: -1 });
};

TransactionSchema.statics.getRevenueStats = async function () {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalStats, monthlyStats] = await Promise.all([
    this.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]),
    this.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: "$amount" },
          monthlyTransactions: { $sum: 1 },
        },
      },
    ]),
  ]);

  const allTransactionsCount = await this.countDocuments();
  const successfulTransactionsCount = await this.countDocuments({
    status: "success",
  });

  return {
    totalRevenue: totalStats[0]?.totalRevenue || 0,
    monthlyRevenue: monthlyStats[0]?.monthlyRevenue || 0,
    totalTransactions: allTransactionsCount,
    successfulTransactions: successfulTransactionsCount,
  };
};

export const Transaction: ITransactionModel =
  (mongoose.models.Transaction as ITransactionModel) ||
  mongoose.model<ITransaction, ITransactionModel>(
    "Transaction",
    TransactionSchema
  );
