import { ok, parseJson, requireUserId, withErrorHandling } from "@/lib/api";
import { createCategory, listCategories } from "@/services/category.service";
import { createCategorySchema } from "@/validations/category";

export const GET = withErrorHandling(async () => {
  const userId = await requireUserId();
  return ok(await listCategories(userId));
});

export const POST = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  const input = await parseJson(req, createCategorySchema);
  return ok(await createCategory(userId, input), 201);
});
