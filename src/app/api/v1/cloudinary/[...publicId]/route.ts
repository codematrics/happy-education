import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    const fullSlug = Array.isArray(publicId) ? publicId.join("/") : publicId;
    if (!fullSlug) {
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }

    let resourceType = "image";
    if (fullSlug.match(/\.(mp4|avi|mov|mkv)$/i)) {
      resourceType = "video";
    }

    const result = await cloudinary.uploader.destroy(fullSlug, {
      resource_type: resourceType,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
