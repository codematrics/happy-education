"use client";

import { useAdminRevenue } from "@/hooks/useAdminRevenue";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingError from "../../common/LoadingError";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import RevenueCharts from "../revenue/RevenueCharts";
import RevenueStats from "../revenue/RevenueStats";
import TopSellingCourses from "../revenue/TopSellingCourses";

const DashboardStats = () => {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useAdminRevenue({
    page: 1,
    limit: 10,
    status: "success",
  });

  if (error) {
    return (
      <LoadingError
        isLoading={false}
        error={error.message}
        errorTitle="Failed to load dashboard data"
        onRetry={refetch}
        skeleton={<div>Loading...</div>}
      >
        <div>Error loading dashboard data</div>
      </LoadingError>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Monitor your platform's performance and key metrics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Revenue Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <RevenueStats statistics={data?.data?.statistics} />
      )}

      {/* Charts and Top Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Charts */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ) : (
            <RevenueCharts monthlyRevenue={data?.data?.monthlyRevenue || []} />
          )}
        </div>

        {/* Top Selling Courses */}
        <div>
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <TopSellingCourses courses={data?.data?.topSellingCourses || []} />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access frequently used admin functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => router.replace("/admin/transactions")}
            >
              <div className="font-semibold">View All Transactions</div>
              <div className="text-sm text-muted-foreground">
                Detailed transaction history and management
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => router.replace("/admin/course/new")}
            >
              <div className="font-semibold">Create New Course</div>
              <div className="text-sm text-muted-foreground">
                Add a new course to your platform
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => router.push("/admin/users")}
            >
              <div className="font-semibold">Manage Users</div>
              <div className="text-sm text-muted-foreground">
                View and manage user accounts
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
