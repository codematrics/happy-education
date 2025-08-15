import { NextResponse } from "next/server";
import { ZodSchema } from "zod";

type ValidationResult<T> = void | ReturnType<typeof NextResponse.json>;

export async function validateSchema<T>(
  schema: ZodSchema<T>,
  json: unknown
): Promise<ValidationResult<T>> {
  const validation = schema.safeParse(json);

  if (!validation.success) {
    return NextResponse.json(
      {
        data: null,
        message: "Invalid input",
        status: false,
        errors: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
}
