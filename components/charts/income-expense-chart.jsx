"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact, formatMoney } from "@/lib/money";

const tick = { fill: "var(--muted)", fontSize: 12 };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-bg/95 px-3 py-2 text-sm shadow-card backdrop-blur">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="num flex justify-between gap-6 text-muted">
          <span className="capitalize">{p.dataKey}</span>
          <span className="text-fg">{formatMoney(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function IncomeExpenseChart({ data, height = 280 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--income)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--income)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--expense)" stopOpacity={0.24} />
              <stop offset="100%" stopColor="var(--expense)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="month" tick={tick} axisLine={false} tickLine={false} />
          <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={56} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--line)" }} />
          <Area type="monotone" dataKey="income" stroke="var(--income)" strokeWidth={2} fill="url(#gi)" animationDuration={900} />
          <Area type="monotone" dataKey="expense" stroke="var(--expense)" strokeWidth={2} fill="url(#ge)" animationDuration={900} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
