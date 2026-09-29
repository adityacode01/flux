import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-surface-2 text-muted",
  income: "bg-income/12 text-income",
  expense: "bg-expense/12 text-expense",
  warn: "bg-warn/15 text-warn",
};

export function Badge({ tone = "neutral", className, ...props }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", tones[tone], className)} {...props} />;
}
