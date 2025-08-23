import connect from "@/lib/db";
import { formDataToJson } from "@/lib/formDataParser";
import { validateSchema } from "@/lib/schemaValidator";
import { authMiddleware } from "@/middlewares/authMiddleware";
import "@/models/CourseVideo";
import { IUser, User } from "@/models/User";
import { userUpdateValidations } from "@/types/schema";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { NextRequest, NextResponse } from "next/server";

const putController = async (
  req: NextRequest,
  { id, admin, user }: { id: string; user?: IUser; admin?: Admin }
) => {
  try {
    const formData = await req.formData();
    const json = formDataToJson(formData);

    validateSchema(userUpdateValidations, json);

    await connect();

    const updatedUser = await User.findOneAndUpdate({ _id: id }, json, {
      new: true,
    });

    if (!updatedUser) {
      return response.error("User Not Found", 404);
    }

    return response.success(updatedUser, "User updated successfully", 200);
  } catch (error) {
    console.error("Error updating user:", error);
    return response.error("Internal Server Error", 400);
  }
};

export const PUT = (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) =>
  authMiddleware(
    req,
    [],
    async (
      r: NextRequest,
      context: {
        user?: IUser;
        admin?: Admin;
      }
    ) => {
      const { id } = await params;
      if (!id) {
        return NextResponse.json(
          { error: "Please provide a valid userId" },
          { status: 400 }
        );
      }

      if ((context.user && id !== context?.user?._id) || !context.admin) {
        return response.error("User is not authorized to the user", 403);
      }

      return await putController(r, {
        id,
        admin: context?.admin,
        user: context?.user,
      });
    }
  );
