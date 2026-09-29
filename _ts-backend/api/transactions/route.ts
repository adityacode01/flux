import { ok, parseJson, parseQuery, requireUserId, withErrorHandling } from "@/lib/api";
import { createTransaction, listTransactions } from "@/services/transaction.service";
import { createTransactionSchema, listTransactionsSchema } from "@/validations/transaction";

export const GET = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  return ok(await listTransactions(userId, parseQuery(req, listTransactionsSchema)));
});

export const POST = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  const input = await parseJson(req, createTransactionSchema);
  return ok(await createTransaction(userId, input), 201);
});
