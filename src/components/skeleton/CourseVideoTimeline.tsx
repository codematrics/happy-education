import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CourseVideoTimelineSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Course Info Card */}
      <Card className="overflow-hidden py-0">
        <div className="md:flex">
          <div className="md:w-80 h-48 md:h-auto">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="flex-1 p-6">
            <CardHeader className="p-0 mb-4">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-20 h-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Player */}
        <div>
          <Skeleton className="h-6 w-24 mb-4" />
          <Card>
            <CardContent className="p-4">
              <Skeleton className="aspect-video w-full mb-4 rounded-lg" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseVideoTimelineSkeleton;
