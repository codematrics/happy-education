import connect from "@/lib/db";
import { validateSchema } from "@/lib/schemaValidator";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Event } from "@/models/Events";
import { IUser } from "@/models/User";
import { Roles } from "@/types/constants";
import { eventValidations } from "@/types/schema";
import { Admin } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

async function getController(
  req: NextRequest,
  { id, admin, user }: { id: string; admin?: Admin; user?: IUser }
) {
  try {
    await connect();

    const event = await Event.findById(id);
    if (!event)
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

async function putController(
  req: NextRequest,
  { id, admin, user }: { id: string; admin?: Admin; user?: IUser }
) {
  try {
    await connect();
    const json = await req.json();
    validateSchema(eventValidations.partial(), json);
    console.log(json);
    const updated = await Event.findByIdAndUpdate(id, json, {
      new: true,
    });
    if (!updated)
      return NextResponse.json({ message: "Event not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Validation or DB error",
        error: error.errors || error.message,
      },
      { status: 400 }
    );
  }
}

async function deleteController(
  req: NextRequest,
  { id, admin, user }: { id: string; admin?: Admin; user?: IUser }
) {
  try {
    await connect();
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ message: "Event not found" }, { status: 404 });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export const DELETE = (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) =>
  authMiddleware(
    req,
    [Roles.admin],
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
          { error: "Please provide a valid courseId" },
          { status: 400 }
        );
      }
      return await deleteController(r, {
        id,
        admin: context?.admin,
        user: context?.user,
      });
    }
  );

export const PUT = (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) =>
  authMiddleware(
    req,
    [Roles.admin],
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
          { error: "Please provide a valid courseId" },
          { status: 400 }
        );
      }
      return await putController(r, {
        id,
        admin: context?.admin,
        user: context?.user,
      });
    }
  );

export const GET = (
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
          { error: "Please provide a valid courseId" },
          { status: 400 }
        );
      }
      return await getController(r, {
        id,
        admin: context?.admin,
        user: context?.user,
      });
    },
    true
  );
