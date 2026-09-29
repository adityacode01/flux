import { prisma } from "@/lib/db";
import { ApiError, notFound } from "@/lib/api";
import { addMonthsUTC, startOfMonthUTC } from "@/lib/dates";
import { num } from "@/lib/decimal";
import { assertCategoryUsable } from "./category.service";

const categorySelect = { select: { id: true, name: true, icon: true, color: true } };

/** Pure calculation, unit-tested: limit + spent -> what the UI shows. */
export function computeBudgetStatus(limit, spent) {
  const percentage = limit > 0 ? Math.round((spent / limit) * 1000) / 10 : 0;
  return {
    limit,
    spent,
    remaining: Math.round((limit - spent) * 100) / 100,
    percentage,
    isOver: spent > limit,
  };
}

export function monthBounds(month) {
  const start = month ? new Date(`${month}-01T00:00:00.000Z`) : startOfMonthUTC(new Date());
  return { start, end: addMonthsUTC(start, 1, 1) };
}

/** Budgets with this month's spend, using one grouped query for all categories. */
export async function listBudgets(userId, month) {
  const { start, end } = monthBounds(month);
  const [budgets, spending] = await Promise.all([
    prisma.budget.findMany({ where: { userId }, include: { category: categorySelect }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ]);
  const spentBy = new Map(spending.map((s) => [s.categoryId, num(s._sum.amount)]));

  return budgets.map((b) => ({
    id: b.id,
    category: b.category,
    ...computeBudgetStatus(num(b.amount), spentBy.get(b.categoryId) ?? 0),
  }));
}

async function serializeOne(userId, id) {
  const all = await listBudgets(userId);
  return all.find((b) => b.id === id);
}

export async function createBudget(userId, { categoryId, amount }) {
  const category = await assertCategoryUsable(userId, categoryId);
  if (category.type === "INCOME") throw new ApiError(422, "Budgets apply to expense categories.", "INVALID_BUDGET_CATEGORY");
  const budget = await prisma.budget.create({ data: { userId, categoryId, amount } }); // unique(user, category) -> 409
  return serializeOne(userId, budget.id);
}

export async function updateBudget(userId, id, { amount }) {
  const { count } = await prisma.budget.updateMany({ where: { id, userId }, data: { amount } });
  if (count === 0) throw notFound("Budget");
  return serializeOne(userId, id);
}

export async function deleteBudget(userId, id) {
  const { count } = await prisma.budget.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound("Budget");
}
