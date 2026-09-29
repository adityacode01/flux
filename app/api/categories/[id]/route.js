import { ok, parseJson, requireUserId, routeParams, withErrorHandling } from "@/lib/api";
import { deleteCategory, updateCategory } from "@/services/category.service";
import { updateCategorySchema } from "@/validations/category";
import { idParamSchema } from "@/validations/common";

export const PATCH = withErrorHandling(async (req, ctx) => {
  const userId = await requireUserId();
  const { id } = await routeParams(ctx, idParamSchema);
  return ok(await updateCategory(userId, id, await parseJson(req, updateCategorySchema)));
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  const userId = await requireUserId();
  const { id } = await routeParams(ctx, idParamSchema);
  await deleteCategory(userId, id);
  return ok({ deleted: true });
});
