"use client";

import { useCourse } from "@/hooks/useCourses";
import { CourseCurrency } from "@/types/constants";
import { Course, Testimonial } from "@/types/types";
import {
  Award,
  Calendar,
  CheckCircle,
  DollarSign,
  IndianRupee,
  Star,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CustomCarousel from "../common/CustomCarousel";
import CustomImage from "../common/CustomImage";
import CustomVideo from "../common/CustomVideo";
import LoadingError from "../common/LoadingError";
import CourseDetailsSkeleton from "../skeleton/CourseDetails";
import TestimonialCard from "../testimonal/TestimonialCard";
import { Button } from "../ui/button";
import CourseCard from "./CourseCard";

const CourseDetails = ({ courseId }: { courseId: string }) => {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useCourse({
    courseId,
    relatedCourse: true,
  });
  const enrollBtnRef = useRef<HTMLButtonElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!descRef.current) return;

    const el = descRef.current;
    const lineHeight = parseInt(getComputedStyle(el).lineHeight || "20", 10);
    const maxHeight = lineHeight * 3;
    setIsOverflowing(el.scrollHeight > maxHeight);
  }, [data?.data?.description]);

  const [showFixedEnroll, setShowFixedEnroll] = useState(false);

  useEffect(() => {
    if (!enrollBtnRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFixedEnroll(!entry.isIntersecting);
      },
      { root: null, threshold: 0 }
    );

    observer.observe(enrollBtnRef.current);

    return () => observer.disconnect();
  }, [enrollBtnRef.current]);

  return (
    <LoadingError
      skeleton={<CourseDetailsSkeleton />}
      isLoading={isLoading}
      errorTitle="Failed To Load Course Details"
      error={error?.message}
      onRetry={refetch}
    >
      <div className="min-h-screen">
        <section className="relative py-10 lg:py-20 bg-gradient-to-r from-primary/10 to-info/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  {data?.data?.name}
                </h1>

                <div>
                  <p
                    ref={descRef}
                    className={`text-sm ${
                      expanded ? "" : "line-clamp-3"
                    } text-muted-foreground leading-relaxed`}
                  >
                    {data?.data.description}
                  </p>
                  {isOverflowing && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 p-0 text-primary"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? "Show less" : "Show more"}
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                  {/* <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{data?.data.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{data?.data.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span>{data?.data.rating} rating</span>
                </div> */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Lifetime access</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-3xl font-bold text-primary">
                    {data?.data?.currency === CourseCurrency.dollar ? (
                      <DollarSign className="w-8 h-8" />
                    ) : (
                      <IndianRupee className="w-8 h-8" />
                    )}
                    <span>{data?.data.price}</span>
                  </div>
                  {/* {data?.data.originalPrice && ( */}
                  {/* <span className="text-xl text-muted-foreground line-through"> */}
                  {/* ${data?.data.originalPrice} */}
                  {/* </span> */}
                  {/* )} */}
                </div>
              </div>

              {/* Course Preview Card */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl shadow-strong overflow-hidden sticky top-24">
                  <div className="relative">
                    {data?.data?.previewVideo ? (
                      <CustomVideo
                        duration={data?.data?.previewVideo?.duration}
                        thumbnail={data?.data?.thumbnail?.url}
                        src={data?.data.previewVideo?.url}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      data?.data?.thumbnail.url && (
                        <CustomImage
                          src={data?.data.thumbnail?.url}
                          alt={data?.data.name}
                          className="w-full h-48 object-cover"
                        />
                      )
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <Button
                      ref={enrollBtnRef}
                      size="lg"
                      className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth"
                      // onClick={handlePurchase}
                    >
                      Enroll Now -{" "}
                      {data?.data?.currency === CourseCurrency.dollar
                        ? "$"
                        : "₹"}
                      {data?.data.price}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      30-day money-back guarantee
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div
                className={`${
                  data?.data?.relatedCourse?.length
                    ? "lg:col-span-2"
                    : "lg:col-span-3"
                } space-y-12`}
              >
                <div>
                  <h2 className="text-3xl font-bold mb-6">
                    Course Description
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {data?.data.description}
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-6">What You'll Learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {data?.data.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-6">
                    Meet Your Instructor
                  </h2>
                  <div className="bg-card rounded-2xl p-6 shadow-soft">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center">
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          John Smith
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Senior Software Engineer with 10+ years of experience
                          at top tech companies. Passionate about teaching and
                          helping students achieve their career goals.
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>50,000+ students</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-warning text-warning" />
                            <span>4.8 instructor rating</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {data?.data?.relatedCourse?.length && (
                <div className="lg:col-span-1">
                  <div className="space-y-6">
                    <div className="bg-card rounded-2xl p-6 shadow-soft">
                      <h3 className="text-xl font-semibold mb-4">
                        Related Courses
                      </h3>
                      <div className="space-y-4">
                        {data?.data?.relatedCourse?.map(
                          (relatedCourse: Course) => (
                            <div
                              key={relatedCourse._id}
                              className="flex space-x-3 cursor-pointer hover:bg-secondary/50 p-2 rounded-lg transition-smooth"
                              onClick={() =>
                                router.push(`/course/${relatedCourse._id}`)
                              }
                            >
                              <CustomImage
                                src={relatedCourse?.thumbnail?.url}
                                alt={relatedCourse?.name}
                                className="w-16 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm line-clamp-2">
                                  {relatedCourse?.name}
                                </h4>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <span>
                                    {relatedCourse?.currency ===
                                    CourseCurrency.dollar
                                      ? "$"
                                      : "₹"}
                                    {relatedCourse?.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {data?.data?.testimonials &&
              data?.data?.testimonials.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6">Student Reviews</h2>
                  <div className="mb-12 relative px-5">
                    <CustomCarousel
                      data={data?.data?.testimonials || []}
                      render={(testimonial: Testimonial) => (
                        <TestimonialCard testimonial={testimonial} />
                      )}
                      className="basis-1/1 sm:basis-1/2 md:basis-1/3"
                    />
                  </div>
                </div>
              )}

            {data?.data?.relatedCourse &&
              data?.data?.relatedCourse.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6">Related Courses</h2>
                  <div className="mb-12 relative px-5">
                    <CustomCarousel
                      data={data?.data?.relatedCourse || []}
                      className="basis-1/1 md:basis-1/2 lg:sm:basis-1/3"
                      render={(course: Course) => (
                        <CourseCard
                          course={course}
                          showBuy
                          onBuy={() => {}}
                          showBenefits={false}
                        />
                      )}
                    />
                  </div>
                </div>
              )}
          </div>
        </section>

        {showFixedEnroll && (
          <div className="fixed bottom-0 left-0 w-full bg-card shadow-strong border-t border-border z-50">
            <div className="container mx-auto px-4 py-3 flex justify-end items-center">
              <Button
                size="lg"
                className="gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth w-full md:w-auto"
              >
                Enroll Now For{" "}
                {data?.data?.currency === CourseCurrency.dollar ? "$" : "₹"}
                {data?.data.price}
              </Button>
            </div>
          </div>
        )}
      </div>
    </LoadingError>
  );
};

export default CourseDetails;
