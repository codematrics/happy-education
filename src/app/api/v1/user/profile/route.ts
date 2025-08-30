import { processFilesAndReturnUpdatedResults } from "@/lib/cloudinary";
import connect from "@/lib/db";
import { formDataToJson } from "@/lib/formDataParser";
import { decodeJWT, verifyJWT } from "@/lib/jwt";
import { User } from "@/models/User";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connect();

    const userToken = (await cookies()).get("user_token")?.value;

    if (!userToken) {
      return NextResponse.json(
        {
          data: null,
          message: "Unauthorized",
          status: false,
        },
        { status: 401 }
      );
    }

    let parsedToken;
    try {
      parsedToken = userToken;
    } catch (parseError) {
      parsedToken = userToken;
    }

    if (!(await verifyJWT(parsedToken))) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid token",
          status: false,
        },
        { status: 401 }
      );
    }

    const decodedToken = await decodeJWT(parsedToken);
    const userId = decodedToken._id;

    const user = await User.findById(userId)
      .select("-password -otp -otpGenerationTime")
      .lean();

    if (!user) {
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
        data: user,
        message: "Profile fetched successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
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

export const PUT = async (req: NextRequest) => {
  try {
    await connect();

    const userToken = (await cookies()).get("user_token")?.value;

    if (!userToken) {
      return NextResponse.json(
        {
          data: null,
          message: "Unauthorized",
          status: false,
        },
        { status: 401 }
      );
    }

    let parsedToken;
    try {
      parsedToken = userToken;
    } catch (parseError) {
      parsedToken = userToken;
    }

    if (!(await verifyJWT(parsedToken))) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid token",
          status: false,
        },
        { status: 401 }
      );
    }

    const decodedToken = await decodeJWT(parsedToken);
    const userId = decodedToken._id;

    const formData = await req.formData();
    const json = formDataToJson(formData);

    // Remove email from json to prevent updates
    delete json.email;

    // Get existing user data for file uploads
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json(
        {
          data: null,
          message: "User not found",
          status: false,
        },
        { status: 404 }
      );
    }

    // Process file uploads for profile image
    const fileUploadResults = await processFilesAndReturnUpdatedResults(
      ["profileImage"],
      json,
      "users",
      existingUser
    );

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: fileUploadResults },
      { new: true, runValidators: true }
    ).select("-password -otp -otpGenerationTime");

    return NextResponse.json(
      {
        data: updatedUser,
        message: "Profile updated successfully",
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
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
