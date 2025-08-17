import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { Transaction } from "@/models/Transaction";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    // Get user token from cookies
    const userToken = req.cookies.get("user_token")?.value;

    if (!userToken) {
      return NextResponse.json(
        {
          data: null,
          message: "Authentication required",
          status: false,
        },
        { status: 401 }
      );
    }

    // Parse and verify token
    let parsedToken;
    try {
      parsedToken = JSON.parse(userToken);
    } catch {
      parsedToken = userToken;
    }

    const isTokenValid = await verifyJWT(parsedToken);
    if (!isTokenValid) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid authentication token",
          status: false,
        },
        { status: 401 }
      );
    }

    const decodedToken = await decodeJWT(parsedToken);
    const userId = decodedToken._id;

    // Get query parameters for pagination and filtering
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery: any = { userId };
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

    return NextResponse.json(
      {
        data: {
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
        message: "Transactions retrieved successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return NextResponse.json(
      {
        data: null,
        message: "Internal Server Error",
        status: false,
      },
      { status: 500 }
    );
  }
};