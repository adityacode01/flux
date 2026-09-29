import { ok, parseJson, requireUserId, withErrorHandling } from "@/lib/api";
import { createCategory, listCategories } from "@/services/category.service";
import { createCategorySchema } from "@/validations/category";

export const GET = withErrorHandling(async () => ok(await listCategories(await requireUserId())));

export const POST = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  return ok(await createCategory(userId, await parseJson(req, createCategorySchema)), 201);
});
