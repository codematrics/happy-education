import { EventRegistrationStatus } from "@/types/constants";
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

export interface IEventRegistration extends Document {
  eventId: ObjectId;
  eventName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  paymentStatus: EventRegistrationStatus;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  registrationDate: Date;
  joinLinkSent: boolean;
}

const EventRegistrationSchema: Schema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(EventRegistrationStatus),
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    joinLinkSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
EventRegistrationSchema.index({ eventId: 1, registrationDate: -1 });
EventRegistrationSchema.index({ email: 1 });
EventRegistrationSchema.index({ registrationDate: -1 });
EventRegistrationSchema.index({ paymentStatus: 1 });

export interface IEventRegistrationModel extends Model<IEventRegistration> {}

export const EventRegistration: IEventRegistrationModel =
  (mongoose.models.EventRegistration as IEventRegistrationModel) ||
  mongoose.model<IEventRegistration, IEventRegistrationModel>(
    "EventRegistration",
    EventRegistrationSchema
  );
