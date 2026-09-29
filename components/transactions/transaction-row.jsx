import { Badge } from "@/components/ui/badge";
import { iconFor } from "@/lib/icons";
import { formatDate, formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export function CategoryChip({ category, className }) {
  const Icon = iconFor(category.icon);
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span className="grid size-7 place-items-center rounded-md" style={{ background: `${category.color}22`, color: category.color }}>
        <Icon className="size-3.5" />
      </span>
      {category.name}
    </span>
  );
}

export const Amount = ({ type, value, className }) => (
  <span className={cn("num font-medium", type === "INCOME" ? "text-income" : "text-fg", className)}>
    {type === "INCOME" ? "+" : "−"}
    {formatMoney(value)}
  </span>
);

/** Compact row used in "recent transactions" lists. */
export function TransactionRow({ t }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <CategoryChip category={{ ...t.category, name: "" }} className="gap-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{t.description}</p>
        <p className="text-xs text-muted">
          {t.category.name} · {formatDate(t.date, { day: "numeric", month: "short" })}
        </p>
      </div>
      <Amount type={t.type} value={t.amount} />
    </li>
  );
}

export const TypeBadge = ({ type }) => <Badge tone={type === "INCOME" ? "income" : "expense"}>{type === "INCOME" ? "Income" : "Expense"}</Badge>;
