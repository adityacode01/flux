"use client";

import { useState } from "react";
import { PiggyBank, Plus, Trash2, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { CategoryChip } from "@/components/transactions/transaction-row";
import { createBudget, deleteBudget } from "@/lib/api/budgets";
import { ApiClientError } from "@/lib/api/client";
import { formatMoney } from "@/lib/money";

export function BudgetsView({ initial, categories }) {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ categoryId: "", amount: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const available = categories.filter((c) => c.type !== "INCOME" && !budgets.some((b) => b.category.id === c.id));

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!form.categoryId) found.categoryId = "Choose a category";
    if (!(Number(form.amount) > 0)) found.amount = "Enter a monthly limit greater than 0";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const budget = await createBudget({ categoryId: form.categoryId, amount: Number(form.amount) });
      setBudgets((list) => [...list, budget]);
      toast({ title: "Budget created", description: `${budget.category.name}: ${formatMoney(budget.limit)} / month` });
      setForm({ categoryId: "", amount: "" });
      setOpen(false);
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        setErrors(Object.fromEntries(Object.entries(err.details).map(([k, v]) => [k, v?.[0]])));
      } else {
        toast({ variant: "error", title: "Couldn't create budget", description: err.message });
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeletingBusy(true);
    try {
      await deleteBudget(deleting.id);
      setBudgets((list) => list.filter((b) => b.id !== deleting.id));
      toast({ title: "Budget removed", description: deleting.category.name });
      setDeleting(null);
    } catch (err) {
      toast({ variant: "error", title: "Couldn't remove budget", description: err.message });
    } finally {
      setDeletingBusy(false);
    }
  }

  const newButton = (
    <Button variant="primary" onClick={() => setOpen(true)} disabled={available.length === 0}>
      <Plus className="size-4" />
      New budget
    </Button>
  );

  return (
    <>
      <div className="-mt-2 mb-6 flex justify-end">{newButton}</div>

      {budgets.length === 0 ? (
        <EmptyState icon={PiggyBank} title="No budgets yet" description="Set a monthly limit for a category and Flux will track how much you have left." action={newButton} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-center justify-between">
                <CategoryChip category={b.category} />
                <div className="flex items-center gap-2">
                  {b.isOver ? <Badge tone="expense">Over budget</Badge> : b.percentage >= 80 ? <Badge tone="warn">Almost there</Badge> : <Badge>{Math.round(b.percentage)}% used</Badge>}
                  <Button variant="ghost" size="icon" className="size-7 hover:text-expense" onClick={() => setDeleting(b)} aria-label={`Delete ${b.category.name} budget`}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <p className="num mt-5 font-display text-2xl font-semibold">
                {formatMoney(b.spent)}
                <span className="text-base font-normal text-muted"> / {formatMoney(b.limit)}</span>
              </p>
              <Progress value={b.percentage} className="mt-3" />
              <p className={`mt-3 flex items-center gap-1.5 text-sm ${b.isOver ? "text-expense" : "text-muted"}`}>
                {b.isOver && <TriangleAlert className="size-4" />}
                {b.isOver ? `${formatMoney(Math.abs(b.remaining))} over this month's limit` : `${formatMoney(b.remaining)} left this month`}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="New budget" description="Monthly spending limit for one category.">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Category" error={errors.categoryId}>
            {(p) => (
              <Select {...p} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select…</option>
                {available.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Monthly limit" error={errors.amount}>
            {(p) => <Input {...p} inputMode="decimal" placeholder="5000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="num" />}
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Create budget</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={deletingBusy} title="Remove this budget?" description={deleting ? `The limit for "${deleting.category.name}" will be removed. Past spending isn't affected.` : ""} />
    </>
  );
}
