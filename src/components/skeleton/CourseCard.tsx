"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseCardSkeletonProps {
  withMenu?: boolean;
}

const CourseCardSkeleton = ({ withMenu = true }: CourseCardSkeletonProps) => {
  return (
    <Card className="group py-0 hover:shadow-lg transition-all duration-200 border-border bg-card gap-4">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {/* Thumbnail */}
          <Skeleton className="w-full h-48" />
          {/* Dropdown trigger placeholder */}
          {withMenu && (
            <div className="absolute top-3 right-3">
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4">
        <div className="space-y-3">
          {/* Title + Description */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Badge + Date */}
          <div className="flex items-center justify-between pt-1">
            <Badge variant="secondary" className="text-xs">
              <Skeleton className="h-3 w-16" />
            </Badge>
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-6 w-24" />
          <Button
            variant="outline"
            size="sm"
            disabled
            className="pointer-events-none"
          >
            <Skeleton className="h-4 w-20" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCardSkeleton;
