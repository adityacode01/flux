import { ok, parseJson, requireUserId, routeParams, withErrorHandling } from "@/lib/api";
import { deleteBudget, updateBudget } from "@/services/budget.service";
import { updateBudgetSchema } from "@/validations/budget";
import { idParamSchema } from "@/validations/common";

export const PATCH = withErrorHandling(async (req, ctx) => {
  const userId = await requireUserId();
  const { id } = await routeParams(ctx, idParamSchema);
  return ok(await updateBudget(userId, id, await parseJson(req, updateBudgetSchema)));
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  const userId = await requireUserId();
  const { id } = await routeParams(ctx, idParamSchema);
  await deleteBudget(userId, id);
  return ok({ deleted: true });
});
