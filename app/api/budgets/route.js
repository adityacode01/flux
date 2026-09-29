import { ok, parseJson, parseQuery, requireUserId, withErrorHandling } from "@/lib/api";
import { createBudget, listBudgets } from "@/services/budget.service";
import { createBudgetSchema, listBudgetsSchema } from "@/validations/budget";

export const GET = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  const { month } = parseQuery(req, listBudgetsSchema);
  return ok(await listBudgets(userId, month));
});

export const POST = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  return ok(await createBudget(userId, await parseJson(req, createBudgetSchema)), 201);
});
