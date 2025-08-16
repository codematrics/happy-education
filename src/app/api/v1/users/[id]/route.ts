import connect from "@/lib/db";
import { formDataToJson } from "@/lib/formDataParser";
import { validateSchema } from "@/lib/schemaValidator";
import "@/models/CourseVideo";
import { User } from "@/models/User";
import { userUpdateValidations } from "@/types/schema";
import { NextRequest, NextResponse } from "next/server";

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
          message: "User ID is required",
          status: false,
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const json = formDataToJson(formData);

    validateSchema(userUpdateValidations, json);

    await connect();

    console.log(json);

    const updatedUser = await User.findOneAndUpdate({ _id: id }, json, {
      new: true,
    });

    if (!updatedUser) {
      return NextResponse.json(
        {
          data: null,
          message: "User not found",
          status: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: updatedUser,
        message: "User updated successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);

    // Check if it's a validation error from formDataParser
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

    // Check if it's a file upload error
    if (
      error instanceof Error &&
      (error.message.includes("Invalid file type") ||
        error.message.includes("too large") ||
        error.message.includes("Failed to upload"))
    ) {
      return NextResponse.json(
        {
          data: null,
          message: error.message,
          status: false,
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
