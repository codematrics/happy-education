import Hero from "@/components/home/Hero";
import CourseSliderSkeleton from "@/components/skeleton/StaticPageCourseSkeleton";

const loading = () => {
  return (
    <>
      <Hero />
      <CourseSliderSkeleton />
    </>
  );
};

export default loading;
