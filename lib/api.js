import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { auth } from "@/auth";

/** Error with an HTTP status that is safe to show to API clients. */
export class ApiError extends Error {
  constructor(status, message, code = "ERROR", details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (what = "Resource") => new ApiError(404, `${what} not found`, "NOT_FOUND");

export const ok = (data, status = 200) => NextResponse.json({ success: true, data }, { status });

const fail = (status, code, message, details) =>
  NextResponse.json({ success: false, error: { code, message, details } }, { status });

export function errorResponse(error) {
  if (error instanceof ApiError) return fail(error.status, error.code, error.message, error.details);

  if (error instanceof ZodError) {
    return fail(400, "VALIDATION_ERROR", "Please check the highlighted fields.", error.flatten().fieldErrors);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return fail(409, "CONFLICT", "That record already exists.");
    if (error.code === "P2003") return fail(409, "CONFLICT", "This record is still referenced by other data.");
    if (error.code === "P2025") return fail(404, "NOT_FOUND", "Resource not found");
  }

  // Never leak internals to the client; log for the operator.
  console.error("[api] unexpected error", error);
  return fail(500, "INTERNAL_ERROR", "Something went wrong.");
}

/** Wraps a route handler so thrown errors become consistent JSON responses. */
export function withErrorHandling(handler) {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** Returns the signed-in user's id or throws 401. */
export async function requireUserId() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new ApiError(401, "You need to sign in.", "UNAUTHORIZED");
  return id;
}

export async function parseJson(req, schema) {
  let body;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.", "INVALID_JSON");
  }
  return schema.parse(body);
}

/** Parses ?query params; empty values (e.g. `type=`) are treated as absent. */
export function parseQuery(req, schema) {
  const entries = [...req.nextUrl.searchParams.entries()].filter(([, v]) => v !== "");
  return schema.parse(Object.fromEntries(entries));
}

export async function routeParams(ctx, schema) {
  return schema.parse(await ctx.params);
}
