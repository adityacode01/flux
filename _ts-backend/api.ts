import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError, type ZodSchema } from "zod";
import { auth } from "@/auth";

/** Error with an HTTP status that is safe to show to API clients. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = "ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what = "Resource") => new ApiError(404, `${what} not found`, "NOT_FOUND");

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the highlighted fields.",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const map: Record<string, [number, string, string]> = {
      P2002: [409, "CONFLICT", "That record already exists."],
      P2003: [409, "CONFLICT", "This record is still referenced by other data."],
      P2025: [404, "NOT_FOUND", "Resource not found"],
    };
    const hit = map[error.code];
    if (hit) {
      return NextResponse.json(
        { success: false, error: { code: hit[1], message: hit[2] } },
        { status: hit[0] },
      );
    }
  }
  // Never leak internals to the client; log for the server operator.
  console.error("[api] unexpected error", error);
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
    { status: 500 },
  );
}

/** Wraps a route handler so thrown errors become consistent JSON responses. */
export function withErrorHandling<C = unknown>(
  handler: (req: NextRequest, ctx: C) => Promise<Response>,
) {
  return async (req: NextRequest, ctx: C) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** Returns the authenticated user's id or throws 401. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new ApiError(401, "You need to sign in.", "UNAUTHORIZED");
  return id;
}

export async function parseJson<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.", "INVALID_JSON");
  }
  return schema.parse(body);
}

export function parseQuery<T>(req: NextRequest, schema: ZodSchema<T>): T {
  return schema.parse(Object.fromEntries(req.nextUrl.searchParams));
}
