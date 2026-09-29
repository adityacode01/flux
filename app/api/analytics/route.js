import { ok, parseQuery, requireUserId, withErrorHandling } from "@/lib/api";
import { getAnalytics } from "@/services/analytics.service";
import { analyticsQuerySchema } from "@/validations/analytics";

export const GET = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  return ok(await getAnalytics(userId, parseQuery(req, analyticsQuerySchema)));
});
