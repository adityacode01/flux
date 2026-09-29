import { timingSafeEqual } from "node:crypto";
import { ApiError, ok, withErrorHandling } from "@/lib/api";
import { processDueRecurring } from "@/services/recurring.service";

function authorised(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // disabled unless configured
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export const GET = withErrorHandling(async (req) => {
  if (!authorised(req)) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  return ok(await processDueRecurring());
});
