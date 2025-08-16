import { processFilesAndReturnUpdatedResults } from "@/lib/cloudinary";
import connect from "@/lib/db";
import { formDataToJson } from "@/lib/formDataParser";
import { validateSchema } from "@/lib/schemaValidator";
import { Course } from "@/models/Course";
import { Testimonial } from "@/models/Testimonial";
import { testimonialApiUpdateSchema } from "@/types/schema";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          data: null,
          message: "Testimonial ID is required",
          status: false,
        },
        { status: 400 }
      );
    }

    await connect();

    const testimonial = await Testimonial.findById(id).populate("courseId");
    if (!testimonial) {
      return NextResponse.json(
        {
          data: null,
          message: "Testimonial not found",
          status: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: testimonial,
        message: "Testimonial fetched successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching testimonial:", error);
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

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          data: null,
          message: "Testimonial ID is required",
          status: false,
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const json = formDataToJson(formData);

    console.log(json);

    validateSchema(testimonialApiUpdateSchema, json);

    await connect();

    if (json?.courseId && json.courseId.length > 0) {
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

    const testimonial = await Testimonial.findOne({ _id: id });
    if (!testimonial) {
      return NextResponse.json(
        {
          data: null,
          message: "Testimonial not found",
          status: true,
        },
        { status: 404 }
      );
    }
    const finalResults = await processFilesAndReturnUpdatedResults(
      ["thumbnail", "video"],
      json,
      "testimonial",
      testimonial
    );

    const updated = await Testimonial.updateWithVideos(id, finalResults);

    return NextResponse.json(
      {
        data: updated,
        message: "Testimonial updated successfully",
        status: true,
      },
      { status: 200 }
    );
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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          data: null,
          message: "Testimonial ID is required",
          status: false,
        },
        { status: 400 }
      );
    }

    await connect();

    const testimonial = await Testimonial.findOne({ _id: id });
    if (!testimonial) {
      return NextResponse.json(
        {
          data: null,
          message: "Testimonial not found",
          status: true,
        },
        { status: 404 }
      );
    }

    await Testimonial.deleteWithVideos(id);

    return NextResponse.json(
      {
        data: null,
        message: "Testimonial deleted successfully",
        status: true,
      },
      { status: 200 }
    );
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
