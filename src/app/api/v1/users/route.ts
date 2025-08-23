import { hashValue } from "@/lib/bcrypt";
import connect from "@/lib/db";
import {
  createPaginationResponse,
  getPaginationOptions,
  paginate,
} from "@/lib/pagination";
import { validateSchema } from "@/lib/schemaValidator";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { User } from "@/models/User";
import { Roles } from "@/types/constants";
import { userCreateValidations } from "@/types/schema";
import { response } from "@/utils/response";
import { NextRequest } from "next/server";

const getController = async (req: NextRequest) => {
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
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobileNumber: { $regex: search, $options: "i" } },
        ],
      };
    }

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const result = await paginate(User, filter, {
      ...options,
      sort: sortObj,
      fields: [
        "firstName",
        "lastName",
        "email",
        "mobileNumber",
        "createdAt",
        "isVerified",
        "isBlocked",
        "purchasedCourses",
      ],
      populate: "purchasedCourses",
      computeFields: {
        fullName: (item) => `${item.firstName} ${item.lastName}`,
        purchasedCount: (item) => item.purchasedCourses.length,
      },
    });

    const data = createPaginationResponse(
      result.data,
      result.pagination,
      "Users fetched successfully"
    );

    return response.paginatedResponse(data, 200);
  } catch (error) {
    console.error("Error fetching users:", error);
    return response.error("Internal Server Error", 500);
  }
};

const postController = async (req: NextRequest) => {
  try {
    const json = await req.json();

    validateSchema(userCreateValidations, json);

    await connect();

    const { email, password, firstName, lastName, isVerified, isBlocked } =
      json;

    const user = await User.create({
      email,
      password: await hashValue(password),
      firstName,
      lastName,
      isVerified,
      isBlocked,
    });

    return response.success(user, "User Created Successfully", 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return response.error("Internal Server Error", 500);
  }
};

export const POST = async (req: NextRequest) =>
  authMiddleware(req, [Roles.admin], postController);

export const GET = async (req: NextRequest) =>
  authMiddleware(req, [Roles.admin], getController);
