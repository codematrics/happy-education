import CourseDetailsSkeleton from "@/components/skeleton/CourseDetails";

const loading = () => {
  return (
    <div className="p-6 space-y-6">
      <CourseDetailsSkeleton />;
    </div>
  );
};

export default loading;
