// Plain data, no imports: also used by prisma/seed.js which runs outside Next.js.
export const DEFAULT_CATEGORIES = [
  { name: "Food", type: "EXPENSE", icon: "utensils", color: "#f59e0b" },
  { name: "Transport", type: "EXPENSE", icon: "car", color: "#38bdf8" },
  { name: "Shopping", type: "EXPENSE", icon: "shopping-bag", color: "#f472b6" },
  { name: "Entertainment", type: "EXPENSE", icon: "clapperboard", color: "#a78bfa" },
  { name: "Education", type: "EXPENSE", icon: "graduation-cap", color: "#34d399" },
  { name: "Health", type: "EXPENSE", icon: "heart-pulse", color: "#fb7185" },
  { name: "Fitness", type: "EXPENSE", icon: "dumbbell", color: "#2dd4bf" },
  { name: "Bills", type: "EXPENSE", icon: "receipt", color: "#facc15" },
  { name: "Rent", type: "EXPENSE", icon: "home", color: "#818cf8" },
  { name: "Salary", type: "INCOME", icon: "briefcase", color: "#4ade80" },
  { name: "Freelance", type: "INCOME", icon: "laptop", color: "#22d3ee" },
  { name: "Other", type: null, icon: "circle-ellipsis", color: "#94a3b8" },
];
