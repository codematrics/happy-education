"use client";

import { useCourse } from "@/hooks/useCourses";
import { CourseCurrency } from "@/types/constants";
import {
  Award,
  Calendar,
  CheckCircle,
  DollarSign,
  IndianRupee,
  Star,
  Users,
} from "lucide-react";
import CustomImage from "../common/CustomImage";
import CustomVideo from "../common/CustomVideo";
import TestimonialCard from "../testimonal/TestimonialCard";
import { Button } from "../ui/button";

const CourseDetails = ({ courseId }: { courseId: string }) => {
  const { data, isLoading } = useCourse({ courseId, relatedCourse: true });

  return (
    <div className="min-h-screen">
      <section className="relative py-10 lg:py-20 bg-gradient-to-r from-primary/10 to-info/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                {/* {discount > 0 && (
                  <Badge className="gradient-primary text-white border-0">
                    {discount}% OFF
                  </Badge>
                )} */}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                {data?.data?.name}
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                {data?.data.description}
              </p>

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
                    size="lg"
                    className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth"
                    // onClick={handlePurchase}
                  >
                    Enroll Now -{" "}
                    {data?.data?.currency === CourseCurrency.dollar ? "$" : "₹"}
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

      {/* Course Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <div>
                <h2 className="text-3xl font-bold mb-6">Course Description</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {data?.data.description}
                  </p>
                </div>
              </div>

              {/* Benefits */}
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

              {/* Instructor */}
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
                      <h3 className="text-xl font-semibold mb-2">John Smith</h3>
                      <p className="text-muted-foreground mb-4">
                        Senior Software Engineer with 10+ years of experience at
                        top tech companies. Passionate about teaching and
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

              {data?.data?.testimonials &&
                data?.data?.testimonials.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold mb-6">Student Reviews</h2>
                    <div className="space-y-6">
                      {data?.data?.testimonials.map((testimonial) => (
                        <TestimonialCard
                          key={testimonial._id}
                          testimonial={testimonial}
                        />
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Sidebar */}
            {/* <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="text-xl font-semibold mb-4">Course Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Students enrolled
                      </span>
                      <span className="font-semibold">
                        {data?.data.students.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Course rating
                      </span>
                      <span className="font-semibold">
                        {data?.data.rating}/5
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Course level
                      </span>
                      <span className="font-semibold">{data?.data.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold">
                        {data?.data.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="text-xl font-semibold mb-4">
                    Related Courses
                  </h3>
                  <div className="space-y-4">
                    {mockCourses
                      .filter((c) => c.id !== data?.data.id)
                      .slice(0, 3)
                      .map((relatedCourse) => (
                        <div
                          key={data?.data.id}
                          className="flex space-x-3 cursor-pointer hover:bg-secondary/50 p-2 rounded-lg transition-smooth"
                          onClick={() => navigate(`/course/${data?.data.id}`)}
                        >
                          <img
                            src={data?.data.thumbnail}
                            alt={data?.data.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {data?.data.title}
                            </h4>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <span>${data?.data.price}</span>
                              <span>•</span>
                              <Star className="w-3 h-3 fill-warning text-warning" />
                              <span>{data?.data.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetails;
