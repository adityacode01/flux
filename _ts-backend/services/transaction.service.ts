import { Prisma, type TransactionType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiError, notFound } from "@/lib/api";
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  UpdateTransactionInput,
} from "@/validations/transaction";

const include = {
  category: { select: { id: true, name: true, icon: true, color: true } },
} satisfies Prisma.TransactionInclude;

type TransactionWithCategory = Prisma.TransactionGetPayload<{ include: typeof include }>;

/** Converts Decimal/Date fields into JSON-friendly values. */
export function serializeTransaction(t: TransactionWithCategory) {
  return { ...t, amount: t.amount.toNumber(), date: t.date.toISOString() };
}

/** Ensures the category belongs to the user and fits the transaction type. */
async function assertCategoryUsable(userId: string, categoryId: string, type: TransactionType) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw notFound("Category");
  if (category.type && category.type !== type) {
    throw new ApiError(422, `"${category.name}" is an ${category.type.toLowerCase()} category.`, "CATEGORY_TYPE_MISMATCH");
  }
}

export function buildTransactionWhere(userId: string, q: ListTransactionsQuery): Prisma.TransactionWhereInput {
  const amount: Prisma.DecimalFilter = {};
  if (q.minAmount !== undefined) amount.gte = q.minAmount;
  if (q.maxAmount !== undefined) amount.lte = q.maxAmount;

  const date: Prisma.DateTimeFilter = {};
  if (q.from) date.gte = q.from;
  if (q.to) date.lte = q.to;

  return {
    userId, // every query is scoped to the caller
    ...(q.type && { type: q.type }),
    ...(q.categoryId && { categoryId: q.categoryId }),
    ...(Object.keys(amount).length > 0 && { amount }),
    ...(Object.keys(date).length > 0 && { date }),
    ...(q.q && {
      OR: [
        { description: { contains: q.q, mode: "insensitive" } },
        { notes: { contains: q.q, mode: "insensitive" } },
        { category: { name: { contains: q.q, mode: "insensitive" } } },
      ],
    }),
  };
}

export async function listTransactions(userId: string, q: ListTransactionsQuery) {
  const where = buildTransactionWhere(userId, q);
  const [items, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include,
      orderBy: [{ [q.sortBy]: q.order }, { createdAt: "desc" }],
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);
  return {
    items: items.map(serializeTransaction),
    total,
    page: q.page,
    pageSize: q.pageSize,
    totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
  };
}

export async function getTransaction(userId: string, id: string) {
  const t = await prisma.transaction.findFirst({ where: { id, userId }, include });
  if (!t) throw notFound("Transaction");
  return serializeTransaction(t);
}

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  await assertCategoryUsable(userId, input.categoryId, input.type);
  const t = await prisma.transaction.create({
    data: { ...input, notes: input.notes ?? null, userId },
    include,
  });
  return serializeTransaction(t);
}

export async function updateTransaction(userId: string, id: string, input: UpdateTransactionInput) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw notFound("Transaction");

  // Re-validate the category/type pairing using the merged result.
  await assertCategoryUsable(userId, input.categoryId ?? existing.categoryId, input.type ?? existing.type);

  const t = await prisma.transaction.update({ where: { id }, data: input, include });
  return serializeTransaction(t);
}

export async function deleteTransaction(userId: string, id: string) {
  const { count } = await prisma.transaction.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound("Transaction");
}
