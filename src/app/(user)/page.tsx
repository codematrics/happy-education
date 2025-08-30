import ContactLink from "@/components/contact/ContactLink";
import StaticPageCourseList from "@/components/course/StaticPageList";
import LandingPageEvents from "@/components/events/LandingPageEvents";
import Hero from "@/components/home/Hero";
import CourseSliderSkeleton from "@/components/skeleton/StaticPageCourseSkeleton";
import StaticPageTestimonials from "@/components/testimonal/StaticPageTestimonials";
import { getCourses, getEvents, getTestimonial } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

const page = async () => {
  const pageSize = 10;
  const page = 1;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["courses", "", page, pageSize],
    queryFn: () => getCourses(page, pageSize, ""),
  });

  await queryClient.prefetchQuery({
    queryKey: ["testimonials", page, pageSize],
    queryFn: () => getTestimonial(page, pageSize),
  });

  await queryClient.prefetchQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Hero />
        <Suspense fallback={<CourseSliderSkeleton />}>
          <LandingPageEvents />
        </Suspense>
        <Suspense fallback={<CourseSliderSkeleton />}>
          <StaticPageCourseList />
        </Suspense>
        <Suspense fallback={<CourseSliderSkeleton />}>
          <StaticPageTestimonials />
        </Suspense>
        <ContactLink />
      </HydrationBoundary>
    </>
  );
};

export default page;
