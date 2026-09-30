import { ok, parseQuery, requireUserId, withErrorHandling } from "@/lib/api";
import { getStatement } from "@/services/statement.service";
import { statementQuerySchema } from "@/validations/statement";

export const GET = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  return ok(await getStatement(userId, parseQuery(req, statementQuerySchema)));
});