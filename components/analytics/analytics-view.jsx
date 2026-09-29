"use client";

import { useEffect, useRef, useState } from "react";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart";
import { getAnalytics } from "@/lib/api/analytics";
import { formatCompact, formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

const ranges = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "3m", label: "3 months" },
  { id: "6m", label: "6 months" },
  { id: "1y", label: "1 year" },
];

function Tile({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="num mt-2 font-display text-2xl font-semibold">{value}</p>
    </Card>
  );
}

export function AnalyticsView() {
  const { toast } = useToast();
  const [range, setRange] = useState("6m");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    getAnalytics({ range })
      .then((d) => id === requestId.current && setData(d))
      .catch((err) => id === requestId.current && toast({ variant: "error", title: "Couldn't load analytics", description: err.message }))
      .finally(() => id === requestId.current && setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const rangeTabs = (
    <div className="mb-5 flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1 sm:inline-flex" role="radiogroup" aria-label="Time range">
      {ranges.map((r) => (
        <button key={r.id} role="radio" aria-checked={range === r.id} onClick={() => setRange(r.id)} className={cn("rounded-md px-3 py-1.5 text-sm transition-colors", range === r.id ? "bg-fg font-medium text-bg" : "text-muted hover:text-fg")}>
          {r.label}
        </button>
      ))}
    </div>
  );

  if (loading && !data) {
    return (
      <>
        {rangeTabs}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="mt-4 h-72" />
      </>
    );
  }

  const { totals, series, byCategory, topCategories } = data;
  const chartData = series.map((s) => ({ month: s.label, income: s.income, expense: s.expense }));
  const savings = series.map((s) => ({ month: s.label, savings: s.savings }));
  const hasData = totals.transactionCount > 0;

  return (
    <>
      {rangeTabs}

      {!hasData ? (
        <EmptyState icon={BarChart3} title="Nothing to analyse yet" description="Add some transactions in this range and your charts will appear here." />
      ) : (
        <>
          <div className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", loading && "opacity-60")}>
            <Tile label="Total income" value={formatMoney(totals.income)} />
            <Tile label="Total spent" value={formatMoney(totals.expense)} />
            <Tile label="Transactions" value={totals.transactionCount} />
            <Tile label="Average transaction" value={formatMoney(totals.averageAmount)} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader title="Income vs expenses" />
              <div className="p-5 pt-4"><IncomeExpenseChart data={chartData} height={260} /></div>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader title="Spending by category" />
              {byCategory.length === 0 ? (
                <p className="p-5 text-sm text-muted">No expenses in this range.</p>
              ) : (
                <div className="relative h-56">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={byCategory} dataKey="total" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={2} stroke="none" animationDuration={800}>
                        {byCategory.map((c) => <Cell key={c.id} fill={c.color ?? "var(--accent)"} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8 }} itemStyle={{ color: "var(--fg)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Savings trend" />
              <div className="h-60 p-5 pt-4">
                <ResponsiveContainer>
                  <LineChart data={savings} margin={{ left: -8, right: 4, top: 8 }}>
                    <CartesianGrid vertical={false} stroke="var(--line)" />
                    <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={56} />
                    <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="savings" stroke="var(--accent)" strokeWidth={2.5} dot={false} animationDuration={900} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Top spending categories" />
              {topCategories.length === 0 ? (
                <p className="p-5 text-sm text-muted">No expenses in this range.</p>
              ) : (
                <ol className="space-y-4 p-5">
                  {topCategories.map((c) => (
                    <li key={c.id}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span>{c.name}</span>
                        <span className="num text-muted">{formatMoney(c.total)} · {c.percentage}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <div className="bar-grow h-full rounded-full" style={{ width: `${c.percentage}%`, background: c.color ?? "var(--accent)" }} />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
