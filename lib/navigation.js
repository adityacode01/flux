import { ArrowLeftRight, BarChart3, Layers, LayoutDashboard, PiggyBank, Repeat, Settings } from "lucide-react";

export const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export const secondaryNav = [
  { href: "/categories", label: "Categories", icon: Layers },
  { href: "/recurring", label: "Recurring", icon: Repeat },
  { href: "/settings", label: "Settings", icon: Settings },
];
