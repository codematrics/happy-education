import { processFilesAndReturnUpdatedResults } from "@/lib/cloudinary";
import connect from "@/lib/db";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { validateSchema } from "@/lib/schemaValidator";
import { Course } from "@/models/Course";
import { Testimonial } from "@/models/Testimonial";
import { User } from "@/models/User";
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

    // Check if user is authenticated to determine isPurchased status
    let authenticatedUserId = null;
    let purchasedCourses: any[] = [];

    const userToken = req.cookies.get("user_token")?.value;
    if (userToken) {
      try {
        let parsedToken;
        try {
          parsedToken = JSON.parse(userToken);
        } catch {
          parsedToken = userToken;
        }

        if (await verifyJWT(parsedToken)) {
          const decodedToken = await decodeJWT(parsedToken);
          authenticatedUserId = decodedToken._id;

          const user = await User.findById(authenticatedUserId);
          purchasedCourses = user?.purchasedCourses || [];
        }
      } catch (error) {
        console.log("Token verification failed:", error);
      }
    }

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

    // Add isPurchased field to course data if it exists
    const testimonialData = testimonial.toObject();

    if (Array.isArray(testimonialData.courseId)) {
      testimonialData.courseId = testimonialData.courseId.map((course: any) => {
        const isPurchased = authenticatedUserId
          ? purchasedCourses.some(
              (pc: any) => pc.courseId?.toString() === course._id?.toString()
            )
          : false;

        return {
          ...course,
          isPurchased,
        };
      });
    }

    return NextResponse.json(
      {
        data: testimonialData,
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

    const json = await req.json();

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
