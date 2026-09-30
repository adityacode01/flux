"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Amount, CategoryChip, TypeBadge } from "@/components/transactions/transaction-row";
import { getStatement } from "@/lib/api/statements";
import { formatDate, formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const ranges = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last month" },
  { id: "6m", label: "Last 6 months" },
];

function downloadCsv(items, rangeLabel) {
  const header = ["Date", "Description", "Category", "Type", "Amount"];
  const rows = items.map((t) => [
    t.date.slice(0, 10),
    `"${t.description.replace(/"/g, '""')}"`,
    t.category.name,
    t.type,
    t.amount,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flux-statement-${rangeLabel.toLowerCase().replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function StatementsView() {
  const { toast } = useToast();
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    getStatement(range)
      .then((d) => id === requestId.current && setData(d))
      .catch((err) => id === requestId.current && toast({ variant: "error", title: "Couldn't load statement", description: err.message }))
      .finally(() => id === requestId.current && setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const rangeLabel = ranges.find((r) => r.id === range).label;

  if (loading && !data) {
    return (
      <>
        <Skeleton className="mb-6 h-9 w-64" />
        <Skeleton className="h-28" />
        <Skeleton className="mt-4 h-72" />
      </>
    );
  }

  const { totals, items } = data;
  const net = totals.income - totals.expense;

  return (
    <>
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1" role="radiogroup" aria-label="Statement period">
          {ranges.map((r) => (
            <button key={r.id} role="radio" aria-checked={range === r.id} onClick={() => setRange(r.id)} className={cn("rounded-md px-3 py-1.5 text-sm transition-colors", range === r.id ? "bg-fg font-medium text-bg" : "text-muted hover:text-fg")}>
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => downloadCsv(items, rangeLabel)} disabled={items.length === 0}>
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button onClick={() => window.print()} disabled={items.length === 0}>
            <Printer className="size-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      <div id="statement-print-area">
        <div className="print-only mb-6">
          <h1 className="font-display text-2xl font-semibold">Flux — Statement</h1>
          <p className="text-sm text-muted">{rangeLabel} · {formatDate(data.range.from)} to {formatDate(data.range.to)}</p>
        </div>

        {items.length === 0 ? (
          <EmptyState icon={FileText} title="No transactions in this period" description="Try a longer period, or add some transactions first." />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-5">
                <p className="text-sm text-muted">Total income</p>
                <p className="num mt-2 font-display text-2xl font-semibold text-income">{formatMoney(totals.income)}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm text-muted">Total expenses</p>
                <p className="num mt-2 font-display text-2xl font-semibold text-expense">{formatMoney(totals.expense)}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm text-muted">Net</p>
                <p className={cn("num mt-2 font-display text-2xl font-semibold", net >= 0 ? "text-income" : "text-expense")}>{formatMoney(net)}</p>
              </Card>
            </div>

            <Card className="mt-4 overflow-hidden">
              <CardHeader title="Transactions" description={`${items.length} in this period`} />
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-muted">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Description</th>
                    <th className="px-3 py-3 font-medium">Category</th>
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((t) => (
                    <tr key={t.id}>
                      <td className="num whitespace-nowrap px-5 py-3 text-muted">{formatDate(t.date)}</td>
                      <td className="px-3 py-3 font-medium">{t.description}</td>
                      <td className="px-3 py-3"><CategoryChip category={t.category} /></td>
                      <td className="px-3 py-3"><TypeBadge type={t.type} /></td>
                      <td className="px-5 py-3 text-right"><Amount type={t.type} value={t.amount} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </div>
    </>
  );
}