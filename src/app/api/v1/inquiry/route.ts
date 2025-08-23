import connect from "@/lib/db";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { validateSchema } from "@/lib/schemaValidator";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Inquiry } from "@/models/Inquiry";
import { IUser } from "@/models/User";
import { Roles } from "@/types/constants";
import { inquirySchema } from "@/types/schema";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { NextRequest } from "next/server";

export const getController = async (
  req: NextRequest,
  { admin, user }: { admin?: Admin; user?: IUser }
) => {
  try {
    await connect();

    const searchParams = req.nextUrl.searchParams;
    const options = getPaginationOptions(searchParams);

    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { phone: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
        ],
      };
    }

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const result = await paginate(Inquiry, filter, {
      ...options,
      sort: sortObj,
    });

    const data = createPaginationResponse(
      result.data,
      result.pagination,
      "Inquiries fetched successfully"
    );

    return response.paginatedResponse(data, 200);
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const postController = async (
  req: NextRequest,
  { admin, user }: { admin?: Admin; user?: IUser }
) => {
  try {
    const json = await req.json();

    validateSchema(inquirySchema, json);

    await connect();

    const newInquiry = await Inquiry.create(json);

    return response.success(newInquiry, "Inquiry sent successfully", 201);
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const GET = async (req: NextRequest) =>
  authMiddleware(req, [Roles.admin], getController);

export const POST = async (req: NextRequest) =>
  authMiddleware(req, [Roles.user], postController, true);
