// Demo data for local development. Run with: npm run db:seed
// Idempotent: re-running replaces the demo users and their data.
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_CATEGORIES } from "../lib/constants/default-categories.js";
import { addMonthsUTC, nextOccurrence, startOfDayUTC } from "../lib/dates.js";

const prisma = new PrismaClient();

export const DEMO_USER = { name: "Aarav Sharma", email: "demo@flux.app", password: "Demo@12345" };
export const OTHER_USER = { name: "Priya Nair", email: "other@flux.app", password: "Other@12345" };

// Small deterministic PRNG so the demo data is the same on every machine.
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function resetUser(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  // Category -> Transaction is RESTRICT, so clear children before the user.
  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId: user.id } }),
    prisma.recurringTransaction.deleteMany({ where: { userId: user.id } }),
    prisma.budget.deleteMany({ where: { userId: user.id } }),
    prisma.category.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);
}

async function createUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, categories: { create: DEFAULT_CATEGORIES.map((c) => ({ ...c, isDefault: true })) } },
    include: { categories: true },
  });
  return { user, cat: Object.fromEntries(user.categories.map((c) => [c.name, c.id])) };
}

async function seedDemo(today) {
  await resetUser(DEMO_USER.email);
  const { user, cat } = await createUser(DEMO_USER);
  const rand = rng(42);
  const between = (lo, hi) => Math.round(lo + rand() * (hi - lo));
  const monthStart = addMonthsUTC(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)), -5, 1);

  // --- recurring rules; their past occurrences become linked transactions ---
  const rules = [
    { description: "Salary", type: "INCOME", amount: 85000, category: "Salary", frequency: "MONTHLY", day: 1, active: true },
    { description: "Rent", type: "EXPENSE", amount: 22000, category: "Rent", frequency: "MONTHLY", day: 2, active: true },
    { description: "Airtel broadband", type: "EXPENSE", amount: 999, category: "Bills", frequency: "MONTHLY", day: 20, active: true },
    { description: "Netflix", type: "EXPENSE", amount: 649, category: "Entertainment", frequency: "MONTHLY", day: 18, active: true },
    { description: "Cult.fit membership", type: "EXPENSE", amount: 1499, category: "Fitness", frequency: "MONTHLY", day: 23, active: false },
  ];

  const transactions = [];
  for (const r of rules) {
    const startDate = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), r.day));
    let cursor = startDate;
    const generated = [];
    while (r.active && cursor <= today) {
      generated.push(cursor);
      cursor = nextOccurrence(cursor, r.frequency, r.day);
    }
    while (!r.active && cursor < today) cursor = nextOccurrence(cursor, r.frequency, r.day);

    const rule = await prisma.recurringTransaction.create({
      data: {
        userId: user.id, categoryId: cat[r.category], type: r.type, amount: r.amount, description: r.description,
        frequency: r.frequency, startDate, nextRunDate: cursor, isActive: r.active, lastRunAt: generated.at(-1) ?? null,
      },
    });
    for (const date of generated) {
      transactions.push({ userId: user.id, categoryId: cat[r.category], type: r.type, amount: r.amount, description: r.description, date, recurringId: rule.id });
    }
  }

  // --- everyday spending, month by month ---
  const add = (date, category, type, amount, description, notes = null) => {
    if (date > today) return;
    transactions.push({ userId: user.id, categoryId: cat[category], type, amount, description, date, notes });
  };
  const foods = ["Swiggy dinner", "Zomato lunch", "Cafe Coffee Day", "Chai & snacks", "Biryani Blues"];
  const rides = ["Uber to office", "Ola cab", "Metro card recharge", "Auto fare"];
  const shops = ["Amazon order", "Myntra — clothes", "Flipkart order", "Decathlon"];

  for (let m = 0; m < 6; m++) {
    const base = addMonthsUTC(monthStart, m, 1);
    const day = (d) => new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), Math.min(d, 28)));
    for (let i = 0; i < between(9, 13); i++) add(day(between(1, 28)), "Food", "EXPENSE", between(180, 900), foods[between(0, foods.length - 1)]);
    add(day(6), "Food", "EXPENSE", between(2000, 3200), "Groceries — BigBasket");
    add(day(19), "Food", "EXPENSE", between(1800, 2800), "Groceries — Blinkit");
    for (let i = 0; i < between(5, 8); i++) add(day(between(1, 28)), "Transport", "EXPENSE", between(80, 450), rides[between(0, rides.length - 1)]);
    for (let i = 0; i < between(1, 3); i++) add(day(between(3, 27)), "Shopping", "EXPENSE", between(800, 4500), shops[between(0, shops.length - 1)]);
    add(day(8), "Bills", "EXPENSE", between(1200, 2400), "Electricity bill");
    if (m % 2 === 0) add(day(12), "Health", "EXPENSE", between(400, 1800), "Apollo pharmacy");
    if (m % 3 === 1) add(day(15), "Education", "EXPENSE", between(999, 2499), "Udemy course");
    if (m % 2 === 1) add(day(24), "Freelance", "INCOME", between(12000, 25000), "Freelance — web project");
    add(day(26), "Entertainment", "EXPENSE", between(300, 900), "Movie tickets");
  }

  await prisma.transaction.createMany({ data: transactions });

  const budgets = { Food: 5000, Shopping: 3000, Transport: 2500, Entertainment: 1500, Fitness: 2000 };
  await prisma.budget.createMany({ data: Object.entries(budgets).map(([name, amount]) => ({ userId: user.id, categoryId: cat[name], amount })) });

  return transactions.length;
}

// A second user with a little data, handy for checking that accounts are isolated.
async function seedOther(today) {
  await resetUser(OTHER_USER.email);
  const { user, cat } = await createUser(OTHER_USER);
  const day = (back) => new Date(startOfDayUTC(today).getTime() - back * 86_400_000);
  await prisma.transaction.createMany({
    data: [
      { userId: user.id, categoryId: cat.Salary, type: "INCOME", amount: 60000, description: "Salary", date: day(10) },
      { userId: user.id, categoryId: cat.Food, type: "EXPENSE", amount: 450, description: "Lunch", date: day(2) },
    ],
  });
}

async function main() {
  const today = startOfDayUTC(new Date());
  const count = await seedDemo(today);
  await seedOther(today);
  console.log(`Seeded ${count} demo transactions.`);
  console.log(`Demo login:  ${DEMO_USER.email} / ${DEMO_USER.password}`);
  console.log(`Other user:  ${OTHER_USER.email} / ${OTHER_USER.password}  (for isolation checks)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
