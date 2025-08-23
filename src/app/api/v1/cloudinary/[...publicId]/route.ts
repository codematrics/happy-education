import { authMiddleware } from "@/middlewares/authMiddleware";
import { IUser } from "@/models/User";
import { Roles } from "@/types/constants";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function deleteController(
  req: NextRequest,
  { fullSlug, admin }: { fullSlug: string; admin?: Admin }
) {
  try {
    let resourceType = "image";
    if (fullSlug.match(/\.(mp4|avi|mov|mkv)$/i)) {
      resourceType = "video";
    }

    const result = await cloudinary.uploader.destroy(fullSlug, {
      resource_type: resourceType,
    });

    return response.success(result, "File has been deleted successfully", 200);
  } catch (error: any) {
    return response.error(error.message || "Something went wrong", 501);
  }
}

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string | string[] }> }
) =>
  await authMiddleware(
    req,
    [Roles.admin],
    async (
      r: NextRequest,
      context: {
        user?: IUser;
        admin?: Admin;
      }
    ) => {
      const { publicId } = await params;
      const fullSlug = Array.isArray(publicId) ? publicId.join("/") : publicId;
      if (!fullSlug) {
        return NextResponse.json(
          { error: "Please provide a valid publicId" },
          { status: 400 }
        );
      }
      return await deleteController(r, {
        fullSlug,
        admin: context?.admin,
      });
    }
  );
