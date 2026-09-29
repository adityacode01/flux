import { ok, parseJson, requireUserId, routeParams, withErrorHandling } from "@/lib/api";
import { deleteTransaction, getTransaction, updateTransaction } from "@/services/transaction.service";
import { idParamSchema } from "@/validations/common";
import { updateTransactionSchema } from "@/validations/transaction";

export const GET = withErrorHandling(async (_req, ctx) => {
  const userId = await requireUserId();
  const { id } = await routeParams(ctx, idParamSchema);
  return ok(await getTransaction(userId, id));
});

export const PATCH = withErrorHandling(async (req, ctx) => {
  const userId = await requireUserId();
  const { id } = await routeParams(ctx, idParamSchema);
  return ok(await updateTransaction(userId, id, await parseJson(req, updateTransactionSchema)));
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  const userId = await requireUserId();
  const { id } = await routeParams(ctx, idParamSchema);
  await deleteTransaction(userId, id);
  return ok({ deleted: true });
});
