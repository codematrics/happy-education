import connect from "@/lib/db";
import { validateSchema } from "@/lib/schemaValidator";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Event } from "@/models/Events";
import { Roles } from "@/types/constants";
import { eventValidations } from "@/types/schema";
import { Admin } from "@/types/types";
import { response } from "@/utils/response";
import { NextRequest } from "next/server";

const getController = async (_req: NextRequest) => {
  try {
    const events = await Event.find().sort({ day: 1 });
    return response.success(events, "Event fetched Successfully", 200);
  } catch (error: any) {
    return response.error("Something went wrong", 500);
  }
};

const postController = async (
  req: NextRequest,
  { admin }: { admin?: Admin }
) => {
  try {
    const json = await req.json();

    validateSchema(eventValidations, json);
    const finalResults = {
      ...json,
    };

    await connect();

    const newEvent = await Event.create(finalResults);

    return response.success(newEvent, "Event Created Successfully", 201);
  } catch (error) {
    console.error("Error creating course:", error);
    return response.error("Something went wrong", 500);
  }
};

export const GET = async (req: NextRequest) =>
  await authMiddleware(req, [Roles.user], getController, true);

export const POST = async (req: NextRequest) =>
  await authMiddleware(req, [Roles.admin], postController);
