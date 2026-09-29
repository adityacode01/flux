"use client"

import { useTheme } from "@/components/providers/theme-provider";
import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-lg border border-line bg-surface px-3 text-sm text-fg placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none aria-[invalid=true]:border-expense";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(base, "h-10", className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  const { theme } = useTheme();
  return (
    <select
      ref={ref}
      style={{ colorScheme: theme }}
      className={cn(base, "h-10 appearance-none", className)}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(base, "min-h-20 py-2", className)} {...props} />;
});

/** Label + control + error message wired together for accessibility. */
export function Field({ label, error, hint, children }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {typeof children === "function" ? children({ id, "aria-invalid": !!error, "aria-describedby": error ? `${id}-err` : undefined }) : children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="text-xs text-expense">
          {error}
        </p>
      )}
    </div>
  );
}
