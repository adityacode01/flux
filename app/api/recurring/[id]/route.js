import { ok, parseJson, requireUserId, routeParams, withErrorHandling } from "@/lib/api";
import { deleteRecurring, updateRecurring } from "@/services/recurring.service";
import { idParamSchema } from "@/validations/common";
import { updateRecurringSchema } from "@/validations/recurring";

export const PATCH = withErrorHandling(async (req, ctx) => {
  const userId = await requireUserId();
  const { id } = await routeParams(ctx, idParamSchema);
  return ok(await updateRecurring(userId, id, await parseJson(req, updateRecurringSchema)));
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  const userId = await requireUserId();
  const { id } = await routeParams(ctx, idParamSchema);
  await deleteRecurring(userId, id);
  return ok({ deleted: true });
});
