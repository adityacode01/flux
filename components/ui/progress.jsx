import { cn } from "@/lib/utils";

/** Budget bar: accent under 80%, amber at 80-99%, red when over budget. */
export function Progress({ value, className }) {
  const pct = Math.min(100, Math.max(0, value));
  const tone = value > 100 ? "bg-expense" : value >= 80 ? "bg-warn" : "bg-accent";
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-surface-2", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("bar-grow h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}
