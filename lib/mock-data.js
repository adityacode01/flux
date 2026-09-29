// TEMPORARY sample data so the UI can be designed before the API is wired.
// Every export here is replaced by a fetch to /api/* in the wiring step.

export const categories = [
  { id: "c-food", name: "Food", type: "EXPENSE", icon: "utensils", color: "#f59e0b" },
  { id: "c-transport", name: "Transport", type: "EXPENSE", icon: "car", color: "#38bdf8" },
  { id: "c-shopping", name: "Shopping", type: "EXPENSE", icon: "shopping-bag", color: "#f472b6" },
  { id: "c-fun", name: "Entertainment", type: "EXPENSE", icon: "clapperboard", color: "#a78bfa" },
  { id: "c-edu", name: "Education", type: "EXPENSE", icon: "graduation-cap", color: "#34d399" },
  { id: "c-health", name: "Health", type: "EXPENSE", icon: "heart-pulse", color: "#fb7185" },
  { id: "c-fitness", name: "Fitness", type: "EXPENSE", icon: "dumbbell", color: "#2dd4bf" },
  { id: "c-bills", name: "Bills", type: "EXPENSE", icon: "receipt", color: "#facc15" },
  { id: "c-rent", name: "Rent", type: "EXPENSE", icon: "home", color: "#818cf8" },
  { id: "c-salary", name: "Salary", type: "INCOME", icon: "briefcase", color: "#4ade80" },
  { id: "c-freelance", name: "Freelance", type: "INCOME", icon: "laptop", color: "#22d3ee" },
  { id: "c-other", name: "Other", type: null, icon: "circle-ellipsis", color: "#94a3b8" },
];

const cat = (id) => categories.find((c) => c.id === id);

export const transactions = [
  ["t1", "2026-09-27", "Swiggy dinner", "c-food", "EXPENSE", 640],
  ["t2", "2026-09-26", "Amazon — headphones", "c-shopping", "EXPENSE", 3499],
  ["t3", "2026-09-25", "Uber to office", "c-transport", "EXPENSE", 312],
  ["t4", "2026-09-24", "Freelance — landing page", "c-freelance", "INCOME", 18000],
  ["t5", "2026-09-23", "Cult.fit membership", "c-fitness", "EXPENSE", 1499],
  ["t6", "2026-09-22", "Zomato lunch", "c-food", "EXPENSE", 420],
  ["t7", "2026-09-20", "Airtel broadband", "c-bills", "EXPENSE", 999],
  ["t8", "2026-09-18", "Netflix", "c-fun", "EXPENSE", 649],
  ["t9", "2026-09-15", "Udemy course", "c-edu", "EXPENSE", 1199],
  ["t10", "2026-09-12", "Apollo pharmacy", "c-health", "EXPENSE", 860],
  ["t11", "2026-09-05", "Metro card recharge", "c-transport", "EXPENSE", 500],
  ["t12", "2026-09-03", "Groceries — BigBasket", "c-food", "EXPENSE", 2840],
  ["t13", "2026-09-02", "Rent — September", "c-rent", "EXPENSE", 22000],
  ["t14", "2026-09-01", "Salary — September", "c-salary", "INCOME", 85000],
].map(([id, date, description, categoryId, type, amount]) => ({
  id,
  date,
  description,
  type,
  amount,
  categoryId,
  category: cat(categoryId),
  notes: null,
}));

export const budgets = [
  { id: "b1", category: cat("c-food"), limit: 5000, spent: 3900 },
  { id: "b2", category: cat("c-shopping"), limit: 3000, spent: 3499 },
  { id: "b3", category: cat("c-transport"), limit: 2500, spent: 812 },
  { id: "b4", category: cat("c-fun"), limit: 1500, spent: 1230 },
  { id: "b5", category: cat("c-fitness"), limit: 2000, spent: 1499 },
];

export const monthlySeries = [
  { month: "Apr", income: 85000, expense: 44200 },
  { month: "May", income: 91000, expense: 52800 },
  { month: "Jun", income: 85000, expense: 47300 },
  { month: "Jul", income: 98000, expense: 61500 },
  { month: "Aug", income: 85000, expense: 49900 },
  { month: "Sep", income: 103000, expense: 36418 },
];

export const spendingByCategory = [
  { name: "Rent", value: 22000, color: "#818cf8" },
  { name: "Shopping", value: 3499, color: "#f472b6" },
  { name: "Food", value: 3900, color: "#f59e0b" },
  { name: "Fitness", value: 1499, color: "#2dd4bf" },
  { name: "Bills", value: 999, color: "#facc15" },
  { name: "Other", value: 4521, color: "#94a3b8" },
];

export const summary = {
  balance: 412650,
  income: 103000,
  expenses: 36418,
  savings: 66582,
  savingsRate: 64.6,
  monthSpending: 36418,
  lastMonthSpending: 49900,
};

export const recurring = [
  { id: "r1", description: "Rent", amount: 22000, type: "EXPENSE", frequency: "MONTHLY", nextRunDate: "2026-10-02", isActive: true, category: cat("c-rent") },
  { id: "r2", description: "Salary", amount: 85000, type: "INCOME", frequency: "MONTHLY", nextRunDate: "2026-10-01", isActive: true, category: cat("c-salary") },
  { id: "r3", description: "Airtel broadband", amount: 999, type: "EXPENSE", frequency: "MONTHLY", nextRunDate: "2026-10-20", isActive: true, category: cat("c-bills") },
  { id: "r4", description: "Netflix", amount: 649, type: "EXPENSE", frequency: "MONTHLY", nextRunDate: "2026-10-18", isActive: true, category: cat("c-fun") },
  { id: "r5", description: "Cult.fit", amount: 1499, type: "EXPENSE", frequency: "MONTHLY", nextRunDate: "2026-10-23", isActive: false, category: cat("c-fitness") },
];
