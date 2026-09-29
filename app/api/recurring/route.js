import { ok, parseJson, requireUserId, withErrorHandling } from "@/lib/api";
import { createRecurring, listRecurring } from "@/services/recurring.service";
import { createRecurringSchema } from "@/validations/recurring";

export const GET = withErrorHandling(async () => ok(await listRecurring(await requireUserId())));

export const POST = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  return ok(await createRecurring(userId, await parseJson(req, createRecurringSchema)), 201);
});
