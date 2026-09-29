import { ok, parseJson, parseQuery, requireUserId, withErrorHandling } from "@/lib/api";
import { createTransaction, listTransactions } from "@/services/transaction.service";
import { createTransactionSchema, listTransactionsSchema } from "@/validations/transaction";

export const GET = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  return ok(await listTransactions(userId, parseQuery(req, listTransactionsSchema)));
});

export const POST = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  return ok(await createTransaction(userId, await parseJson(req, createTransactionSchema)), 201);
});
