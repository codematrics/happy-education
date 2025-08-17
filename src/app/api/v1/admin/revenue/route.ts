import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import "@/models/Course";
import { Transaction } from "@/models/Transaction";
import "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    // Get admin token from cookies
    const adminToken = req.cookies.get("admin_token")?.value;

    if (!adminToken) {
      return NextResponse.json(
        {
          data: null,
          message: "Admin authentication required",
          status: false,
        },
        { status: 401 }
      );
    }

    // Parse and verify admin token
    let parsedToken;
    try {
      parsedToken = JSON.parse(adminToken);
    } catch {
      parsedToken = adminToken;
    }

    const isTokenValid = await verifyJWT(parsedToken);
    if (!isTokenValid) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid admin authentication token",
          status: false,
        },
        { status: 401 }
      );
    }

    const decodedToken = await decodeJWT(parsedToken);
    console.log(decodedToken);

    // Verify admin role (assuming admin check logic exists)
    if (!decodedToken.isAdmin) {
      return NextResponse.json(
        {
          data: null,
          message: "Admin access required",
          status: false,
        },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery: any = {};
    if (status) filterQuery.status = status;
    if (courseId) filterQuery.courseId = courseId;
    if (startDate || endDate) {
      filterQuery.createdAt = {};
      if (startDate) filterQuery.createdAt.$gte = new Date(startDate);
      if (endDate) filterQuery.createdAt.$lte = new Date(endDate);
    }

    // Get revenue statistics
    const revenueStats = await Transaction.getRevenueStats();

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filterQuery)
        .populate("userId", "firstName lastName email")
        .populate("courseId", "name price accessType")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filterQuery),
    ]);

    // Get top-selling courses
    const topSellingCourses = await Transaction.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: "$courseId",
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      { $unwind: "$courseInfo" },
      {
        $project: {
          courseId: "$_id",
          courseName: "$courseInfo.name",
          price: "$courseInfo.price",
          accessType: "$courseInfo.accessType",
          totalSales: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Get monthly revenue trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format monthly revenue for charts
    const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      monthName: new Date(item._id.year, item._id.month - 1).toLocaleString(
        "default",
        { month: "short" }
      ),
      revenue: item.revenue,
      transactions: item.transactions,
    }));

    // Format transactions for response
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction._id,
      orderId: transaction.orderId,
      paymentId: transaction.paymentId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      user: {
        id: (transaction.userId as any)._id,
        name: `${(transaction.userId as any).firstName} ${
          (transaction.userId as any).lastName
        }`,
        email: (transaction.userId as any).email,
      },
      course: {
        id: (transaction.courseId as any)._id,
        name: (transaction.courseId as any).name,
        price: (transaction.courseId as any).price,
        accessType: (transaction.courseId as any).accessType,
      },
      createdAt: transaction.createdAt,
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        data: {
          statistics: {
            totalRevenue: revenueStats.totalRevenue,
            monthlyRevenue: revenueStats.monthlyRevenue,
            totalTransactions: revenueStats.totalTransactions,
            successfulTransactions: revenueStats.successfulTransactions,
            successRate:
              revenueStats.totalTransactions > 0
                ? (
                    (revenueStats.successfulTransactions /
                      revenueStats.totalTransactions) *
                    100
                  ).toFixed(2)
                : "0.00",
          },
          transactions: formattedTransactions,
          topSellingCourses,
          monthlyRevenue: formattedMonthlyRevenue,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            limit,
          },
        },
        message: "Revenue data retrieved successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching revenue data:", error);
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

// Export revenue data as CSV
export const POST = async (req: NextRequest) => {
  try {
    await connect();

    // Verify admin authentication (same as GET)
    const adminToken = req.cookies.get("admin_token")?.value;
    if (!adminToken) {
      return NextResponse.json(
        { message: "Admin authentication required" },
        { status: 401 }
      );
    }

    let parsedToken;
    try {
      parsedToken = JSON.parse(adminToken);
    } catch {
      parsedToken = adminToken;
    }

    const isTokenValid = await verifyJWT(parsedToken);
    if (!isTokenValid) {
      return NextResponse.json(
        { message: "Invalid admin token" },
        { status: 401 }
      );
    }

    const decodedToken = await decodeJWT(parsedToken);
    if (!decodedToken.isAdmin) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const {
      startDate,
      endDate,
      courseId,
      status = "success",
    } = await req.json();

    // Build filter query
    const filterQuery: any = { status };
    if (courseId) filterQuery.courseId = courseId;
    if (startDate || endDate) {
      filterQuery.createdAt = {};
      if (startDate) filterQuery.createdAt.$gte = new Date(startDate);
      if (endDate) filterQuery.createdAt.$lte = new Date(endDate);
    }

    // Get all transactions for export
    const transactions = await Transaction.find(filterQuery)
      .populate("userId", "firstName lastName email")
      .populate("courseId", "name price accessType")
      .sort({ createdAt: -1 });

    // Generate CSV content
    const csvHeaders = [
      "Transaction ID",
      "Order ID",
      "Payment ID",
      "User Name",
      "User Email",
      "Course Name",
      "Course Type",
      "Amount",
      "Currency",
      "Status",
      "Date",
    ];

    const csvRows = transactions.map((transaction) => [
      transaction._id,
      transaction.orderId,
      transaction.paymentId,
      `${(transaction.userId as any).firstName} ${
        (transaction.userId as any).lastName
      }`,
      (transaction.userId as any).email,
      (transaction.courseId as any).name,
      (transaction.courseId as any).accessType,
      transaction.amount,
      transaction.currency,
      transaction.status,
      transaction.createdAt.toISOString(),
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=revenue-report-${Date.now()}.csv`,
      },
    });
  } catch (error) {
    console.error("Error exporting revenue data:", error);
    return NextResponse.json(
      {
        data: null,
        message: "Export failed",
        status: false,
      },
      { status: 500 }
    );
  }
};
