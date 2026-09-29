"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ type: "EXPENSE", amount: "", categoryId: "", description: "", frequency: "MONTHLY", startDate: today(), endDate: "" });

function validate(v) {
  const e = {};
  const amount = Number(v.amount);
  if (!v.amount || Number.isNaN(amount) || amount <= 0) e.amount = "Enter an amount greater than 0";
  if (!v.categoryId) e.categoryId = "Choose a category";
  if (!v.description.trim()) e.description = "Add a short description";
  if (!v.startDate) e.startDate = "Pick a start date";
  if (v.endDate && v.endDate < v.startDate) e.endDate = "End date must be after the start date";
  return e;
}

export function RecurringFormDialog({ open, onClose, categories, onSubmit }) {
  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) (setErrors({}), setValues(blank()));
  }, [open]);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const options = categories.filter((c) => !c.type || c.type === values.type);

  async function submit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSubmit({ ...values, amount: Number(values.amount), endDate: values.endDate || null });
      onClose();
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        setErrors((prev) => ({ ...prev, ...Object.fromEntries(Object.entries(err.details).map(([k, v]) => [k, v?.[0]])) }));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="New recurring transaction" description="Repeats automatically on the schedule you set.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1" role="radiogroup" aria-label="Type">
          {["EXPENSE", "INCOME"].map((t) => (
            <button key={t} type="button" role="radio" aria-checked={values.type === t} onClick={() => setValues((v) => ({ ...v, type: t, categoryId: "" }))} className={cn("rounded-md py-1.5 text-sm font-medium transition-colors", values.type === t ? "bg-bg shadow-sm" : "text-muted")}>
              {t === "EXPENSE" ? "Expense" : "Income"}
            </button>
          ))}
        </div>

        <Field label="Description" error={errors.description}>{(p) => <Input {...p} placeholder="e.g. Rent" value={values.description} onChange={set("description")} maxLength={140} />}</Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" error={errors.amount}>{(p) => <Input {...p} inputMode="decimal" placeholder="0.00" value={values.amount} onChange={set("amount")} className="num" />}</Field>
          <Field label="Category" error={errors.categoryId}>
            {(p) => (
              <Select {...p} value={values.categoryId} onChange={set("categoryId")}>
                <option value="">Select…</option>
                {options.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            )}
          </Field>
        </div>
        <Field label="Frequency">
          {(p) => (
            <Select {...p} value={values.frequency} onChange={set("frequency")}>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </Select>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date" error={errors.startDate}>{(p) => <Input {...p} type="date" value={values.startDate} onChange={set("startDate")} />}</Field>
          <Field label="End date (optional)" error={errors.endDate}>{(p) => <Input {...p} type="date" value={values.endDate} onChange={set("endDate")} />}</Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={saving}>Create rule</Button>
        </div>
      </form>
    </Dialog>
  );
}
