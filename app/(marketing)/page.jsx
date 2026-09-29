import Link from "next/link";
import { BarChart3, Lock, PiggyBank, Repeat, Search, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FlowChart } from "@/components/marketing/flow-chart";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { budgets, spendingByCategory, summary, transactions } from "@/lib/mock-data";
import { formatMoney } from "@/lib/money";

const features = [
  { icon: Wallet, title: "Every rupee, recorded", text: "Log income and expenses in seconds, with categories, notes and dates that stay searchable.", wide: true },
  { icon: PiggyBank, title: "Budgets that warn you", text: "Set a monthly limit per category and see what's left, before it's gone." },
  { icon: Repeat, title: "Recurring, on schedule", text: "Rent, salary and subscriptions repeat on their own." },
  { icon: BarChart3, title: "Analytics you can read", text: "Trends across 7 days to a year, without spreadsheets.", wide: true },
  { icon: Search, title: "Find anything fast", text: "Search 'Amazon' or 'Gym' and get answers, filtered on the server." },
  { icon: Lock, title: "Yours alone", text: "Passwords are hashed and every query is scoped to your account." },
];

export default function LandingPage() {
  const total = spendingByCategory.reduce((s, c) => s + c.value, 0);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
        <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">Know where your money goes.</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">Flux tracks your income, expenses and budgets in one calm place, so you can see the month before it ends.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register"><Button variant="primary" size="lg">Create free account</Button></Link>
          <Link href="/login"><Button size="lg">Try the demo</Button></Link>
        </div>

        <div className="relative mt-14 overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-accent/15 blur-3xl" aria-hidden />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Total balance</p>
              <p className="num font-display text-4xl font-semibold md:text-5xl">{formatMoney(summary.balance)}</p>
            </div>
            <Badge tone="income">{summary.savingsRate}% of income saved</Badge>
          </div>
          <div className="mt-6 h-44 md:h-64"><FlowChart /></div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
        <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight md:text-4xl">Everything you need, nothing you don&apos;t.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text, wide }) => (
            <Card key={title} className={`p-6 ${wide ? "md:col-span-2" : ""}`}>
              <Icon className="size-5 text-accent" />
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 max-w-md text-sm text-muted">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="preview" className="mx-auto grid max-w-6xl scroll-mt-20 gap-4 px-5 py-16 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="font-display font-semibold">Spending by category</h3>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full">
            {spendingByCategory.map((c) => <div key={c.name} style={{ width: `${(c.value / total) * 100}%`, background: c.color }} title={c.name} />)}
          </div>
          <ul className="mt-5 space-y-2 text-sm">
            {spendingByCategory.slice(0, 4).map((c) => (
              <li key={c.name} className="flex justify-between"><span className="flex items-center gap-2"><i className="size-2 rounded-full" style={{ background: c.color }} />{c.name}</span><span className="num text-muted">{formatMoney(c.value)}</span></li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-semibold">Budgets</h3>
          <ul className="mt-5 space-y-5">
            {budgets.slice(0, 3).map((b) => {
              const pct = (b.spent / b.limit) * 100;
              return (
                <li key={b.id}>
                  <div className="mb-2 flex justify-between text-sm"><span>{b.category.name}</span><span className="num text-muted">{Math.round(pct)}%</span></div>
                  <Progress value={pct} />
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="px-6 pb-2 pt-6">
          <h3 className="font-display font-semibold">Recent activity</h3>
          <ul className="mt-2 divide-y divide-line">{transactions.slice(0, 4).map((t) => <TransactionRow key={t.id} t={t} />)}</ul>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-8">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card md:p-14">
          <h2 className="mx-auto max-w-lg font-display text-3xl font-semibold tracking-tight md:text-4xl">Start with this month.</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">Add a few transactions and your dashboard fills in right away.</p>
          <Link href="/register" className="mt-7 inline-block"><Button variant="primary" size="lg">Create free account</Button></Link>
        </div>
      </section>
    </main>
  );
}
