import connect from "@/lib/db";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Transaction } from "@/models/Transaction";
import { IUser } from "@/models/User";
import { Roles } from "@/types/constants";
import { response } from "@/utils/response";
import { NextRequest } from "next/server";

const getController = async (req: NextRequest, { user }: { user?: IUser }) => {
  try {
    await connect();

    // Get query parameters for pagination and filtering
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery: any = { userId: user };
    if (status && ["success", "failed", "pending"].includes(status)) {
      filterQuery.status = status;
    }

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filterQuery)
        .populate("courseId", "name thumbnail price accessType")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filterQuery),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Format transactions for response
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction._id,
      orderId: transaction.orderId,
      paymentId: transaction.paymentId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      course: {
        id: (transaction.courseId as any)._id,
        name: (transaction.courseId as any).name,
        thumbnail: (transaction.courseId as any).thumbnail,
        price: (transaction.courseId as any).price,
        accessType: (transaction.courseId as any).accessType,
        isPurchased: transaction.status === "success",
      },
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }));

    return response.success(
      {
        transactions: formattedTransactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          limit,
        },
      },
      "Transactions retrieved successfully",
      200
    );
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const GET = async (req: NextRequest) =>
  authMiddleware(req, [Roles.user], getController);
