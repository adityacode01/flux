import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, PiggyBank, TrendingDown } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { auth } from "@/auth";
import { getDashboard } from "@/services/dashboard.service";
import { formatMoney } from "@/lib/money";
import { ArrowLeftRight, Plus } from "lucide-react";

export const metadata = { title: "Dashboard" };

function Stat({ label, value, icon: Icon, tone, note }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-sm text-muted">
        {label}
        <Icon className={`size-4 ${tone}`} />
      </div>
      <p className="num mt-3 font-display text-2xl font-semibold">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const firstName = (session?.user?.name ?? "there").split(" ")[0];
  const { summary, recent, budgets, trend, byCategory } = await getDashboard(session.user.id);

  const totalCat = byCategory.reduce((s, c) => s + c.total, 0);
  const change = summary.lastMonthSpending > 0 ? ((summary.monthSpending - summary.lastMonthSpending) / summary.lastMonthSpending) * 100 : 0;
  const chartData = trend.map((t) => ({ month: t.label, income: t.income, expense: t.expense }));

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} description="Here's where your money stands this month." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden p-6 lg:col-span-1">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent/15 blur-3xl" aria-hidden />
          <p className="text-sm text-muted">Total balance</p>
          <p className="num mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">{formatMoney(summary.balance)}</p>
          <div className="mt-5 flex items-center gap-2 text-sm">
            <Badge tone="income">{summary.savingsRate}% saved</Badge>
            <span className="text-muted">of this month&apos;s income</span>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <Stat label="Income" value={formatMoney(summary.income)} icon={ArrowUpRight} tone="text-income" note="This month" />
          <Stat
            label="Expenses"
            value={formatMoney(summary.expenses)}
            icon={ArrowDownRight}
            tone="text-expense"
            note={summary.lastMonthSpending > 0 ? `${Math.abs(change).toFixed(0)}% ${change < 0 ? "less" : "more"} than last month` : "No data for last month yet"}
          />
          <Stat label="Savings" value={formatMoney(summary.savings)} icon={PiggyBank} tone="text-accent" note="Income minus expenses" />
          <Stat label="Spent this month" value={formatMoney(summary.monthSpending)} icon={TrendingDown} tone="text-muted" note="Across all categories" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Income vs expenses" description="Last 6 months" />
          <div className="p-5 pt-4">
            <IncomeExpenseChart data={chartData} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Spending by category" description="This month" />
          {byCategory.length === 0 ? (
            <p className="p-5 text-sm text-muted">No expenses recorded yet this month.</p>
          ) : (
            <ul className="space-y-4 p-5">
              {byCategory.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="num text-muted">{formatMoney(c.total)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="bar-grow h-full rounded-full" style={{ width: `${(c.total / totalCat) * 100}%`, background: c.color ?? "var(--accent)" }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Budgets" action={<Link href="/budgets" className="text-sm text-muted hover:text-fg">View all</Link>} />
          {budgets.length === 0 ? (
            <p className="p-5 text-sm text-muted">No budgets yet. <Link href="/budgets" className="underline underline-offset-2">Create one</Link>.</p>
          ) : (
            <ul className="space-y-5 p-5">
              {budgets.slice(0, 4).map((b) => (
                <li key={b.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {b.category.name}
                      {b.isOver && <Badge tone="expense">Over budget</Badge>}
                    </span>
                    <span className="num text-muted">
                      {formatMoney(b.spent)} / {formatMoney(b.limit)}
                    </span>
                  </div>
                  <Progress value={b.percentage} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent transactions" action={<Link href="/transactions" className="text-sm text-muted hover:text-fg">View all</Link>} />
          {recent.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={ArrowLeftRight} title="No transactions yet" description="Add your first income or expense to start tracking." action={<Link href="/transactions"><Badge tone="income" className="cursor-pointer gap-1 px-3 py-1.5"><Plus className="size-3" />Add one</Badge></Link>} />
            </div>
          ) : (
            <ul className="divide-y divide-line px-5 pb-2">
              {recent.map((t) => (
                <TransactionRow key={t.id} t={t} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
