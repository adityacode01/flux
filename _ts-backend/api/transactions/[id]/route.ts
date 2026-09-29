import { ok, parseJson, requireUserId, withErrorHandling } from "@/lib/api";
import {
  deleteTransaction,
  getTransaction,
  updateTransaction,
} from "@/services/transaction.service";
import { idParamSchema } from "@/validations/common";
import { updateTransactionSchema } from "@/validations/transaction";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Ctx>(async (_req, { params }) => {
  const userId = await requireUserId();
  const { id } = idParamSchema.parse(await params);
  return ok(await getTransaction(userId, id));
});

export const PATCH = withErrorHandling<Ctx>(async (req, { params }) => {
  const userId = await requireUserId();
  const { id } = idParamSchema.parse(await params);
  const input = await parseJson(req, updateTransactionSchema);
  return ok(await updateTransaction(userId, id, input));
});

export const DELETE = withErrorHandling<Ctx>(async (_req, { params }) => {
  const userId = await requireUserId();
  const { id } = idParamSchema.parse(await params);
  await deleteTransaction(userId, id);
  return ok({ deleted: true });
});
