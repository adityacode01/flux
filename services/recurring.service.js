import { prisma } from "@/lib/db";
import { notFound } from "@/lib/api";
import { nextOccurrence } from "@/lib/dates";
import { num } from "@/lib/decimal";
import { assertCategoryUsable } from "./category.service";

const include = { category: { select: { id: true, name: true, icon: true, color: true } } };
const MAX_OCCURRENCES_PER_RUN = 400; // guards against a rule that was dormant for years

export const serializeRecurring = (r) => ({
  ...r,
  amount: num(r.amount),
  startDate: r.startDate.toISOString(),
  endDate: r.endDate?.toISOString() ?? null,
  nextRunDate: r.nextRunDate.toISOString(),
  lastRunAt: r.lastRunAt?.toISOString() ?? null,
});

export async function listRecurring(userId) {
  const rows = await prisma.recurringTransaction.findMany({ where: { userId }, include, orderBy: [{ isActive: "desc" }, { nextRunDate: "asc" }] });
  return rows.map(serializeRecurring);
}

export async function createRecurring(userId, input) {
  await assertCategoryUsable(userId, input.categoryId, input.type);
  const row = await prisma.recurringTransaction.create({
    data: { ...input, endDate: input.endDate ?? null, userId, nextRunDate: input.startDate },
    include,
  });
  return serializeRecurring(row);
}

export async function updateRecurring(userId, id, input) {
  const existing = await prisma.recurringTransaction.findFirst({ where: { id, userId } });
  if (!existing) throw notFound("Recurring transaction");
  await assertCategoryUsable(userId, input.categoryId ?? existing.categoryId, input.type ?? existing.type);
  const row = await prisma.recurringTransaction.update({ where: { id }, data: input, include });
  return serializeRecurring(row);
}

export async function deleteRecurring(userId, id) {
  // Generated transactions stay (recurringId becomes null via onDelete: SetNull).
  const { count } = await prisma.recurringTransaction.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound("Recurring transaction");
}

/** Pure: which dates a rule owes, up to `now`. Unit-tested. */
export function dueOccurrences(rule, now = new Date()) {
  const anchorDay = rule.startDate.getUTCDate();
  const dates = [];
  let cursor = rule.nextRunDate;
  while (cursor <= now && (!rule.endDate || cursor <= rule.endDate) && dates.length < MAX_OCCURRENCES_PER_RUN) {
    dates.push(cursor);
    cursor = nextOccurrence(cursor, rule.frequency, anchorDay);
  }
  return { dates, next: cursor };
}

/**
 * Generates transactions for every due rule. Safe to call from a cron, a button, or twice at once:
 *  - (recurringId, date) is unique, so an occurrence can never be inserted twice;
 *  - the rule is advanced with a compare-and-set on nextRunDate, so two workers can't both claim it.
 * Pass userId to limit processing to one user's rules.
 */
export async function processDueRecurring({ userId, now = new Date() } = {}) {
  const rules = await prisma.recurringTransaction.findMany({
    where: { isActive: true, nextRunDate: { lte: now }, ...(userId && { userId }) },
  });

  let created = 0;
  for (const rule of rules) {
    const { dates, next } = dueOccurrences(rule, now);
    if (dates.length === 0) continue;
    const finished = rule.endDate && next > rule.endDate;

    try {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.recurringTransaction.updateMany({
          where: { id: rule.id, nextRunDate: rule.nextRunDate },
          data: { nextRunDate: next, lastRunAt: now, ...(finished && { isActive: false }) },
        });
        if (claimed.count === 0) return; // another worker got there first

        const result = await tx.transaction.createMany({
          skipDuplicates: true,
          data: dates.map((date) => ({
            userId: rule.userId,
            categoryId: rule.categoryId,
            type: rule.type,
            amount: rule.amount,
            description: rule.description,
            date,
            recurringId: rule.id,
          })),
        });
        created += result.count;
      });
    } catch (error) {
      console.error(`[recurring] rule ${rule.id} failed`, error); // one bad rule must not block the rest
    }
  }
  return { processedRules: rules.length, created };
}
