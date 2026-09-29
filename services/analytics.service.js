import { prisma } from "@/lib/db";
import { resolveRange, stepBucket, truncate } from "@/lib/dates";
import { num, round1 } from "@/lib/decimal";

const dayKey = (d) => d.toISOString().slice(0, 10);

function bucketLabel(d, unit) {
  const opts = unit === "month" ? { month: "short", year: "2-digit", timeZone: "UTC" } : { day: "numeric", month: "short", timeZone: "UTC" };
  return new Intl.DateTimeFormat("en-IN", opts).format(d);
}

/** Pure: raw rows [{bucket: Date, type, total, count}] -> continuous series with empty buckets filled. */
export function buildSeries(rows, from, to, unit) {
  const byKey = new Map();
  for (const r of rows) {
    const key = dayKey(r.bucket);
    const entry = byKey.get(key) ?? { income: 0, expense: 0 };
    if (r.type === "INCOME") entry.income += num(r.total);
    else entry.expense += num(r.total);
    byKey.set(key, entry);
  }

  const series = [];
  for (let cursor = truncate(from, unit); cursor <= to; cursor = stepBucket(cursor, unit)) {
    const { income = 0, expense = 0 } = byKey.get(dayKey(cursor)) ?? {};
    series.push({
      bucket: dayKey(cursor),
      label: bucketLabel(cursor, unit),
      income: num(income),
      expense: num(expense),
      savings: num(income - expense),
    });
  }
  return series;
}

/** Pure: totals -> the headline numbers. */
export function computeTotals({ income, expense, count }) {
  const savings = num(income - expense);
  return {
    income: num(income),
    expense: num(expense),
    savings,
    savingsRate: income > 0 ? round1((savings / income) * 100) : 0,
    transactionCount: count,
    averageAmount: count > 0 ? num((income + expense) / count) : 0,
  };
}

export async function getSeries(userId, from, to, unit) {
  // `unit` comes from our own resolveRange (day | week | month), never from user input.
  const rows = await prisma.$queryRaw`
    SELECT date_trunc(${unit}::text, "date") AS bucket, "type"::text AS type, SUM("amount") AS total
    FROM "Transaction"
    WHERE "userId" = ${userId} AND "date" >= ${from} AND "date" <= ${to}
    GROUP BY 1, 2
    ORDER BY 1`;
  return buildSeries(rows, from, to, unit);
}

export async function getCategoryBreakdown(userId, from, to) {
  const groups = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type: "EXPENSE", date: { gte: from, lte: to } },
    _sum: { amount: true },
  });
  if (groups.length === 0) return [];

  const categories = await prisma.category.findMany({
    where: { userId, id: { in: groups.map((g) => g.categoryId) } },
    select: { id: true, name: true, icon: true, color: true },
  });
  const byId = new Map(categories.map((c) => [c.id, c]));
  const total = groups.reduce((s, g) => s + num(g._sum.amount), 0);

  return groups
    .map((g) => ({ ...byId.get(g.categoryId), total: num(g._sum.amount), percentage: total > 0 ? round1((num(g._sum.amount) / total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);
}

export async function getTotals(userId, from, to) {
  const groups = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId, date: { gte: from, lte: to } },
    _sum: { amount: true },
    _count: { _all: true },
  });
  const pick = (type) => groups.find((g) => g.type === type);
  return computeTotals({
    income: num(pick("INCOME")?._sum.amount),
    expense: num(pick("EXPENSE")?._sum.amount),
    count: groups.reduce((s, g) => s + g._count._all, 0),
  });
}

export async function getAnalytics(userId, query, now = new Date()) {
  const { from, to, unit } = resolveRange(query.range, now, { from: query.from, to: query.to });
  const [totals, series, byCategory] = await Promise.all([
    getTotals(userId, from, to),
    getSeries(userId, from, to, unit),
    getCategoryBreakdown(userId, from, to),
  ]);
  return {
    range: { preset: query.range, from: from.toISOString(), to: to.toISOString(), unit },
    totals,
    series,
    byCategory,
    topCategories: byCategory.slice(0, 5),
  };
}
