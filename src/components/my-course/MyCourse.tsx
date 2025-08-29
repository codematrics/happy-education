"use client";

import CourseCard from "@/components/course/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourses } from "@/hooks/useCourses";
import useMyCourses from "@/hooks/useMyCourses";
import { BookOpen, Search, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MyCourses = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("purchased");
  const [searchQuery, setSearchQuery] = useState("");
  const [exploreSearchQuery, setExploreSearchQuery] = useState("");

  // Fetch my purchased courses
  const {
    data: myCoursesData,
    isLoading: myCoursesLoading,
    error: myCoursesError,
    refetch,
  } = useMyCourses({
    page: 1,
    limit: 20,
    search: searchQuery,
  });

  // Fetch available courses for explore tab
  const {
    data: exploreCoursesData,
    isLoading: exploreCoursesLoading,
    error: exploreCoursesError,
  } = useCourses({
    page: 1,
    limit: 12,
    search: exploreSearchQuery,
    excludePurchased: true,
  });

  const myCourses = myCoursesData?.data?.items || [];
  const exploreCourses = exploreCoursesData?.data?.items || [];

  // Get progress data from API response
  const getProgressForCourse = (course: {
    progress?: {
      progressPercentage: number;
      completedVideos: number;
      totalVideos: number;
    };
    courseVideos?: any[];
  }) => {
    if (course.progress) {
      return {
        percentage: course.progress.progressPercentage,
        completedLessons: course.progress.completedVideos,
        totalLessons: course.progress.totalVideos,
      };
    }
    return {
      percentage: 0,
      completedLessons: 0,
      totalLessons: course.courseVideos?.length || 1,
    };
  };

  const handleCoursePurchase = (id: string) => {
    router.push(`/course/${id}`);
  };

  const totalProgress =
    myCourses.length > 0
      ? Math.round(
          myCourses.reduce(
            (sum, course) => sum + getProgressForCourse(course).percentage,
            0
          ) / myCourses.length
        )
      : 0;

  if (myCoursesError || exploreCoursesError) {
    return (
      <div className="min-h-dvh py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-6">
              Failed to load courses. Please try again later.
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">My Learning Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Track your progress and continue your learning journey
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card rounded-2xl p-6 shadow-lg border">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{myCourses.length}</div>
                <div className="text-sm text-muted-foreground">
                  Enrolled Courses
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg border">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalProgress}%</div>
                <div className="text-sm text-muted-foreground">
                  Average Progress
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="purchased">My Courses</TabsTrigger>
            <TabsTrigger value="available">Explore More</TabsTrigger>
          </TabsList>

          <TabsContent value="purchased" className="space-y-8">
            {/* Search for My Courses */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search my courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {myCoursesLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">
                  Loading your courses...
                </p>
              </div>
            ) : myCourses.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Continue Learning</h2>
                  <p className="text-muted-foreground">
                    {myCourses.length} course{myCourses.length !== 1 ? "s" : ""}{" "}
                    in progress
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCourses.map((course) => {
                    const progress = getProgressForCourse(course);
                    return (
                      <CourseCard
                        key={course._id}
                        course={course}
                        showContinue={true}
                        showBuy={false}
                        progress={progress}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your learning journey by enrolling in your first course.
                </p>
                <Button
                  onClick={() => setActiveTab("available")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Browse Courses
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold">Explore New Courses</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search courses..."
                    value={exploreSearchQuery}
                    onChange={(e) => setExploreSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/courses")}
                >
                  View All Courses
                </Button>
              </div>
            </div>

            {exploreCoursesLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading courses...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exploreCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onBuy={handleCoursePurchase}
                    showBuy={true}
                    showContinue={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyCourses;
