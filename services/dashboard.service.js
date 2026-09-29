import { prisma } from "@/lib/db";
import { addMonthsUTC, startOfMonthUTC } from "@/lib/dates";
import { num, round1 } from "@/lib/decimal";
import { getCategoryBreakdown, getSeries } from "./analytics.service";
import { listBudgets } from "./budget.service";
import { serializeTransaction } from "./transaction.service";

const sumsByType = async (userId, where = {}) => {
  const groups = await prisma.transaction.groupBy({ by: ["type"], where: { userId, ...where }, _sum: { amount: true } });
  const pick = (t) => num(groups.find((g) => g.type === t)?._sum.amount);
  return { income: pick("INCOME"), expense: pick("EXPENSE") };
};

/** Everything the dashboard needs, in parallel and without loading transaction rows in bulk. */
export async function getDashboard(userId, now = new Date()) {
  const monthStart = startOfMonthUTC(now);
  const nextMonth = addMonthsUTC(monthStart, 1, 1);
  const lastMonth = addMonthsUTC(monthStart, -1, 1);
  const trendFrom = addMonthsUTC(monthStart, -5, 1);

  const [allTime, month, previous, recent, budgets, trend, byCategory] = await Promise.all([
    sumsByType(userId),
    sumsByType(userId, { date: { gte: monthStart, lt: nextMonth } }),
    sumsByType(userId, { date: { gte: lastMonth, lt: monthStart } }),
    prisma.transaction.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    listBudgets(userId),
    getSeries(userId, trendFrom, nextMonth, "month"),
    getCategoryBreakdown(userId, monthStart, new Date(nextMonth.getTime() - 1)),
  ]);

  const savings = num(month.income - month.expense);
  return {
    summary: {
      balance: num(allTime.income - allTime.expense),
      income: month.income,
      expenses: month.expense,
      savings,
      savingsRate: month.income > 0 ? round1((savings / month.income) * 100) : 0,
      monthSpending: month.expense,
      lastMonthSpending: previous.expense,
    },
    recent: recent.map(serializeTransaction),
    budgets,
    trend,
    byCategory,
  };
}
