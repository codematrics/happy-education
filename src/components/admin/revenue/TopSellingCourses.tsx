"use client";

import { Award, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";

interface TopSellingCourse {
  courseId: string;
  courseName: string;
  price: number;
  accessType: string;
  totalSales: number;
  totalRevenue: number;
}

interface TopSellingCoursesProps {
  courses: TopSellingCourse[];
}

const TopSellingCourses = ({ courses }: TopSellingCoursesProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAccessTypeColor = (accessType: string) => {
    switch (accessType) {
      case "lifetime":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "monthly":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "yearly":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "free":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getAccessTypeLabel = (accessType: string) => {
    switch (accessType) {
      case "lifetime":
        return "लाइफटाइम";
      case "monthly":
        return "मासिक";
      case "yearly":
        return "वार्षिक";
      case "free":
        return "मुफ़्त";
      default:
        return accessType;
    }
  };

  const maxSales = Math.max(...courses.map((course) => course.totalSales), 1);

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>शीर्ष बिकने वाले कोर्स</span>
          </CardTitle>
          <CardDescription>
            सबसे लोकप्रिय कोर्स बिक्री मात्रा के अनुसार
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              कोई बिक्री डेटा उपलब्ध नहीं है
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>शीर्ष बिकने वाले कोर्स</span>
        </CardTitle>
        <CardDescription>
          सबसे लोकप्रिय कोर्स बिक्री मात्रा के अनुसार
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.slice(0, 10).map((course, index) => (
            <div key={course.courseId} className="flex items-center space-x-3">
              {/* Rank */}
              <div className="flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : index === 1
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                      : index === 2
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {course.courseName}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAccessTypeColor(
                      course.accessType
                    )}`}
                  >
                    {getAccessTypeLabel(course.accessType)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{course.totalSales} बिक्री</span>
                  <span className="font-medium">
                    {formatCurrency(course.totalRevenue)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${(course.totalSales / maxSales) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Trend Icon */}
              <div className="flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {courses.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">कुल बिक्री:</span>
                <span className="font-medium">
                  {courses.reduce((sum, course) => sum + course.totalSales, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">कुल राजस्व:</span>
                <span className="font-medium">
                  {formatCurrency(
                    courses.reduce(
                      (sum, course) => sum + course.totalRevenue,
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopSellingCourses;
