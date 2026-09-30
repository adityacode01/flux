import { prisma } from "@/lib/db";
import { resolveRange } from "@/lib/dates";
import { getTotals } from "./analytics.service";
import { serializeTransaction } from "./transaction.service";

const include = { category: { select: { id: true, name: true, icon: true, color: true } } };

export async function getStatement(userId, query, now = new Date()) {
  const { from, to } = resolveRange(query.range, now);

  const [totals, rows] = await Promise.all([
    getTotals(userId, from, to),
    prisma.transaction.findMany({
      where: { userId, date: { gte: from, lte: to } },
      include,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 1000,
    }),
  ]);

  return {
    range: { preset: query.range, from: from.toISOString(), to: to.toISOString() },
    totals,
    items: rows.map(serializeTransaction),
  };
}