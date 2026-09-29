import { ok, requireUserId, withErrorHandling } from "@/lib/api";
import { processDueRecurring } from "@/services/recurring.service";

export const POST = withErrorHandling(async () => {
  const userId = await requireUserId();
  return ok(await processDueRecurring({ userId }));
});
