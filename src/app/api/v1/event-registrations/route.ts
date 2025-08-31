import connect from "@/lib/db";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { EventRegistration } from "@/models/EventRegistrations";
import { Roles } from "@/types/constants";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { NextRequest } from "next/server";

const getController = async (
  req: NextRequest,
  { admin }: { admin?: Admin }
) => {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const eventId = searchParams.get("eventId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const paymentStatus = searchParams.get("paymentStatus");

    // Build filter query
    const filter: any = {};

    if (eventId) {
      filter.eventId = eventId;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (fromDate || toDate) {
      filter.registrationDate = {};
      if (fromDate) {
        filter.registrationDate.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.registrationDate.$lte = new Date(toDate + "T23:59:59.999Z");
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalCount = await EventRegistration.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch registrations with event details
    const registrations = await EventRegistration.find(filter)
      .populate("eventId", "name day amount currency joinLink")
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return response.success(
      {
        items: registrations,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Event registrations fetched successfully",
      200
    );
  } catch (error: any) {
    console.error("Error fetching event registrations:", error);
    return response.error("Failed to fetch event registrations", 500);
  }
};

export const GET = async (req: NextRequest) =>
  authMiddleware(req, [Roles.admin], getController);
