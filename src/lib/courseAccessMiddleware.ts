import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { Course } from "@/models/Course";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export interface CourseAccessResult {
  hasAccess: boolean;
  reason?: string;
  expiryDate?: Date | null;
  accessType?: string;
  isExpired?: boolean;
}

/**
 * Check if user has access to a specific course
 */
export async function checkCourseAccess(
  userId: string,
  courseId: string
): Promise<CourseAccessResult> {
  try {
    await connect();

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return {
        hasAccess: false,
        reason: "Course not found",
      };
    }

    // If course is free, everyone has access
    if (course.accessType === "free") {
      return {
        hasAccess: true,
        accessType: "free",
      };
    }

    // Get user and their purchased courses
    const user = await User.findById(userId);
    if (!user) {
      return {
        hasAccess: false,
        reason: "User not found",
      };
    }

    // Check if user has purchased this course
    const purchasedCourse = user.purchasedCourses.find(
      (pc) => pc.courseId.toString() === courseId
    );

    if (!purchasedCourse) {
      return {
        hasAccess: false,
        reason: "Course not purchased",
        accessType: course.accessType,
      };
    }

    // For lifetime access, always allow
    if (course.accessType === "lifetime") {
      return {
        hasAccess: true,
        accessType: "lifetime",
        expiryDate: null,
      };
    }

    // For monthly/yearly access, check expiry
    if (course.accessType === "monthly" || course.accessType === "yearly") {
      const currentDate = new Date();
      const expiryDate = purchasedCourse.expiryDate;

      if (!expiryDate) {
        // This shouldn't happen, but treat as expired for safety
        return {
          hasAccess: false,
          reason: "Invalid subscription data",
          accessType: course.accessType,
          isExpired: true,
        };
      }

      if (currentDate > expiryDate) {
        return {
          hasAccess: false,
          reason: "Subscription expired",
          accessType: course.accessType,
          expiryDate,
          isExpired: true,
        };
      }

      return {
        hasAccess: true,
        accessType: course.accessType,
        expiryDate,
      };
    }

    return {
      hasAccess: false,
      reason: "Unknown access type",
      accessType: course.accessType,
    };
  } catch (error) {
    console.error("Error checking course access:", error);
    return {
      hasAccess: false,
      reason: "Server error",
    };
  }
}

/**
 * Middleware to validate course access for API routes
 */
export async function validateCourseAccess(
  request: NextRequest,
  courseId: string
): Promise<{
  isValid: boolean;
  userId?: string;
  accessResult?: CourseAccessResult;
  response?: NextResponse;
}> {
  try {
    const userToken = request.cookies.get("user_token")?.value;

    if (!userToken) {
      return {
        isValid: false,
        response: NextResponse.json(
          {
            data: null,
            message: "Authentication required",
            status: false,
          },
          { status: 401 }
        ),
      };
    }

    // Parse and verify token
    let parsedToken;
    try {
      parsedToken = userToken;
    } catch {
      parsedToken = userToken;
    }

    const isTokenValid = await verifyJWT(parsedToken);
    if (!isTokenValid) {
      return {
        isValid: false,
        response: NextResponse.json(
          {
            data: null,
            message: "Invalid authentication token",
            status: false,
          },
          { status: 401 }
        ),
      };
    }

    const decodedToken = await decodeJWT(parsedToken);
    const userId = decodedToken._id;

    // Check course access
    const accessResult = await checkCourseAccess(userId, courseId);

    if (!accessResult.hasAccess) {
      const statusCode =
        accessResult.reason === "Course not purchased"
          ? 403
          : accessResult.isExpired
          ? 402
          : 403;

      return {
        isValid: false,
        userId,
        accessResult,
        response: NextResponse.json(
          {
            data: null,
            message: accessResult.reason || "Access denied",
            status: false,
            accessInfo: {
              accessType: accessResult.accessType,
              isExpired: accessResult.isExpired,
              expiryDate: accessResult.expiryDate,
            },
          },
          { status: statusCode }
        ),
      };
    }

    return {
      isValid: true,
      userId,
      accessResult,
    };
  } catch (error) {
    console.error("Error in course access middleware:", error);
    return {
      isValid: false,
      response: NextResponse.json(
        {
          data: null,
          message: "Server error",
          status: false,
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Calculate expiry date based on access type
 */
export function calculateExpiryDate(
  accessType: "free" | "lifetime" | "monthly" | "yearly",
  purchaseDate: Date = new Date()
): Date | null {
  if (accessType === "free" || accessType === "lifetime") {
    return null;
  }

  const expiryDate = new Date(purchaseDate);

  if (accessType === "monthly") {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else if (accessType === "yearly") {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }

  return expiryDate;
}

/**
 * Get remaining access time for subscription-based courses
 */
export function getRemainingAccessTime(expiryDate: Date | null): {
  isExpired: boolean;
  remainingDays: number;
  remainingHours: number;
  timeLeft: string;
} {
  if (!expiryDate) {
    return {
      isExpired: false,
      remainingDays: Infinity,
      remainingHours: Infinity,
      timeLeft: "Lifetime access",
    };
  }

  const currentDate = new Date();
  const timeDiff = expiryDate.getTime() - currentDate.getTime();

  if (timeDiff <= 0) {
    return {
      isExpired: true,
      remainingDays: 0,
      remainingHours: 0,
      timeLeft: "Expired",
    };
  }

  const remainingDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  let timeLeft = "";
  if (remainingDays > 0) {
    timeLeft = `${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
    if (remainingHours > 0) {
      timeLeft += ` and ${remainingHours} hour${remainingHours > 1 ? "s" : ""}`;
    }
  } else {
    timeLeft = `${remainingHours} hour${remainingHours > 1 ? "s" : ""}`;
  }

  return {
    isExpired: false,
    remainingDays,
    remainingHours,
    timeLeft,
  };
}

/**
 * Check if access is expiring soon (within 7 days)
 */
export function isAccessExpiringSoon(expiryDate: Date | null): boolean {
  if (!expiryDate) return false;

  const currentDate = new Date();
  const timeDiff = expiryDate.getTime() - currentDate.getTime();
  const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return daysRemaining <= 7 && daysRemaining > 0;
}

/**
 * Helper function to get course access status for display
 */
export async function getCourseAccessStatus(
  userId: string,
  courseId: string
): Promise<{
  hasAccess: boolean;
  accessType: string;
  status: "active" | "expired" | "not_purchased" | "free";
  expiryDate?: Date | null;
  timeRemaining?: string;
  isExpiringSoon?: boolean;
}> {
  const accessResult = await checkCourseAccess(userId, courseId);

  if (!accessResult.hasAccess) {
    return {
      hasAccess: false,
      accessType: accessResult.accessType || "unknown",
      status: accessResult.isExpired ? "expired" : "not_purchased",
      expiryDate: accessResult.expiryDate,
    };
  }

  if (accessResult.accessType === "free") {
    return {
      hasAccess: true,
      accessType: "free",
      status: "free",
    };
  }

  if (accessResult.accessType === "lifetime") {
    return {
      hasAccess: true,
      accessType: "lifetime",
      status: "active",
      timeRemaining: "Lifetime access",
    };
  }

  const timeInfo = getRemainingAccessTime(accessResult.expiryDate || null);

  return {
    hasAccess: true,
    accessType: accessResult.accessType || "unknown",
    status: "active",
    expiryDate: accessResult.expiryDate,
    timeRemaining: timeInfo.timeLeft,
    isExpiringSoon: isAccessExpiringSoon(accessResult.expiryDate || null),
  };
}

export default {
  checkCourseAccess,
  validateCourseAccess,
  calculateExpiryDate,
  getRemainingAccessTime,
  isAccessExpiringSoon,
  getCourseAccessStatus,
};
