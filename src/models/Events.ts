import { CourseCurrency } from "@/types/constants";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEvent extends Document {
  name: string;
  image: {
    publicId: string;
    url: string;
  };
  description: string;
  benefits: string[];
  currency: CourseCurrency;
  amount: number;
  day: Date;
  repeating: boolean;
  repeatEvery?: number;
  joinLink: string;
}

const EventSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
    },
    description: {
      type: String,
    },
    benefits: {
      type: [String],
      default: [],
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
    day: {
      type: Date,
      required: true,
    },
    repeating: {
      type: Boolean,
      default: false,
    },
    repeatEvery: {
      type: Number,
      default: null,
    },
    joinLink: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export interface IEventModel extends Model<IEvent> {}

export const Event: IEventModel =
  (mongoose.models.Event as IEventModel) ||
  mongoose.model<IEvent, IEventModel>("Event", EventSchema);
