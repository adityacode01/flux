import { ok, parseJson, requireUserId, withErrorHandling } from "@/lib/api";
import { deleteCategory, updateCategory } from "@/services/category.service";
import { updateCategorySchema } from "@/validations/category";
import { idParamSchema } from "@/validations/common";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(async (req, { params }) => {
  const userId = await requireUserId();
  const { id } = idParamSchema.parse(await params);
  const input = await parseJson(req, updateCategorySchema);
  return ok(await updateCategory(userId, id, input));
});

export const DELETE = withErrorHandling<Ctx>(async (_req, { params }) => {
  const userId = await requireUserId();
  const { id } = idParamSchema.parse(await params);
  await deleteCategory(userId, id);
  return ok({ deleted: true });
});
