"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ type: "EXPENSE", amount: "", categoryId: "", description: "", date: today(), notes: "" });

// Mirrors the server-side Zod rules for instant feedback. The API validates again.
function validate(v) {
  const e = {};
  const amount = Number(v.amount);
  if (!v.amount || Number.isNaN(amount) || amount <= 0) e.amount = "Enter an amount greater than 0";
  else if (Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-6) e.amount = "Use at most 2 decimal places";
  if (!v.categoryId) e.categoryId = "Choose a category";
  if (!v.description.trim()) e.description = "Add a short description";
  if (!v.date) e.date = "Pick a date";
  return e;
}

export function TransactionFormDialog({ open, onClose, categories, transaction, onSubmit }) {
  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editing = !!transaction;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValues(transaction ? { ...transaction, amount: String(transaction.amount), date: transaction.date.slice(0, 10), notes: transaction.notes ?? "" } : blank());
  }, [open, transaction]);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const options = categories.filter((c) => !c.type || c.type === values.type);

  async function submit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSubmit({ ...values, amount: Number(values.amount) });
      onClose();
    } catch (err) {
      // Field-level errors from the server (e.g. a category/type mismatch) stay in the dialog;
      // anything else was already reported as a toast by the caller.
      if (err instanceof ApiClientError && err.details) {
        setErrors((prev) => ({ ...prev, ...Object.fromEntries(Object.entries(err.details).map(([k, v]) => [k, v?.[0]])) }));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={editing ? "Edit transaction" : "Add transaction"}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1" role="radiogroup" aria-label="Type">
          {["EXPENSE", "INCOME"].map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={values.type === t}
              onClick={() => setValues((v) => ({ ...v, type: t, categoryId: "" }))}
              className={cn("rounded-md py-1.5 text-sm font-medium transition-colors", values.type === t ? "bg-bg shadow-sm" : "text-muted")}
            >
              {t === "EXPENSE" ? "Expense" : "Income"}
            </button>
          ))}
        </div>

        <Field label="Amount" error={errors.amount}>
          {(p) => <Input {...p} inputMode="decimal" placeholder="0.00" value={values.amount} onChange={set("amount")} className="num text-lg" />}
        </Field>
        <Field label="Description" error={errors.description}>
          {(p) => <Input {...p} placeholder="e.g. Swiggy dinner" value={values.description} onChange={set("description")} maxLength={140} />}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" error={errors.categoryId}>
            {(p) => (
              <Select {...p} value={values.categoryId} onChange={set("categoryId")}>
                <option value="">Select…</option>
                {options.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Date" error={errors.date}>
            {(p) => <Input {...p} type="date" value={values.date} onChange={set("date")} />}
          </Field>
        </div>
        <Field label="Notes (optional)">{(p) => <Textarea {...p} value={values.notes} onChange={set("notes")} maxLength={1000} />}</Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {editing ? "Save changes" : "Add transaction"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
