import connect from "@/lib/db";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { validateSchema } from "@/lib/schemaValidator";
import { Course } from "@/models/Course";
import { Testimonial } from "@/models/Testimonial";
import { testimonialCreateSchema } from "@/types/schema";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const json = await req.json();

    validateSchema(testimonialCreateSchema, json);

    await connect();

    if (json.courseId && json.courseId.length > 0) {
      const courses = await Course.find({ _id: { $in: json.courseId } });

      if (courses.length !== json.courseId.length) {
        return NextResponse.json(
          {
            data: null,
            message: "One or more courses not found",
            status: false,
          },
          { status: 404 }
        );
      }
    }

    // No need to process files - they're already uploaded to Cloudinary
    const testimonial = await Testimonial.create(json);

    return NextResponse.json(
      {
        data: testimonial,
        message: "Testimonial created successfully",
        status: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating testimonial:", error);

    if (error instanceof Error && error.message.includes("Validation failed")) {
      return NextResponse.json(
        {
          data: null,
          message: "Validation failed",
          status: false,
          errors: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        data: null,
        message: "Internal Server Error",
        status: false,
      },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const options = getPaginationOptions(searchParams);

    const courseId = searchParams.get("courseId") || "";
    await connect();

    if (courseId) {
      const course = await Course.findOne({ _id: courseId });

      if (!course) {
        return NextResponse.json(
          {
            data: null,
            message: "Course Not Found.",
            status: true,
          },
          { status: 404 }
        );
      }

      const filter = {
        courseId: courseId,
      };

      const result = await paginate(Testimonial, filter, {
        ...options,
        populate: "courseId",
      });

      const data = createPaginationResponse(
        result.data,
        result.pagination,
        "Testimonials fetched successfully"
      );

      return NextResponse.json(data, { status: 200 });
    }

    const result = await paginate(
      Testimonial,
      {},
      {
        ...options,
        populate: "courseId",
      }
    );

    const data = createPaginationResponse(
      result.data,
      result.pagination,
      "Testimonials fetched successfully"
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      {
        data: null,
        message: "Internal Server Error",
        status: false,
      },
      { status: 500 }
    );
  }
};
