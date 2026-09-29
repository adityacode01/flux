"use client";

import { useState } from "react";
import { Plus, Repeat, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Amount, CategoryChip } from "@/components/transactions/transaction-row";
import { RecurringFormDialog } from "./recurring-form-dialog";
import { createRecurring, deleteRecurring, updateRecurring } from "@/lib/api/recurring";
import { formatDate } from "@/lib/money";
import { cn } from "@/lib/utils";

const freq = { DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly", YEARLY: "Yearly" };

function Switch({ checked, onChange, label, disabled }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} onClick={onChange} disabled={disabled} className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-50", checked ? "bg-accent" : "bg-surface-2")}>
      <span className={cn("absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-4")} />
    </button>
  );
}

export function RecurringView({ initial, categories }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  async function toggle(item) {
    setBusyId(item.id);
    try {
      const updated = await updateRecurring(item.id, { isActive: !item.isActive });
      setItems((list) => list.map((r) => (r.id === item.id ? updated : r)));
      toast({ title: updated.isActive ? "Resumed" : "Paused", description: item.description });
    } catch (err) {
      toast({ variant: "error", title: "Couldn't update", description: err.message });
    } finally {
      setBusyId(null);
    }
  }

  async function create(values) {
    const created = await createRecurring(values);
    setItems((list) => [created, ...list]);
    toast({ title: "Recurring transaction created", description: created.description });
  }

  async function remove() {
    setDeletingBusy(true);
    try {
      await deleteRecurring(deleting.id);
      setItems((list) => list.filter((r) => r.id !== deleting.id));
      toast({ title: "Deleted", description: deleting.description });
      setDeleting(null);
    } catch (err) {
      toast({ variant: "error", title: "Couldn't delete", description: err.message });
    } finally {
      setDeletingBusy(false);
    }
  }

  const newButton = (
    <Button variant="primary" onClick={() => setOpen(true)}>
      <Plus className="size-4" />
      New recurring
    </Button>
  );

  return (
    <>
      <div className="-mt-2 mb-6 flex justify-end">{newButton}</div>

      {items.length === 0 ? (
        <EmptyState icon={Repeat} title="No recurring transactions" description="Add rent, salary or subscriptions once and Flux keeps them on schedule." action={newButton} />
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li key={r.id}>
              <Card className={cn("flex flex-wrap items-center gap-x-4 gap-y-3 p-4 transition-opacity", !r.isActive && "opacity-60")}>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-medium">{r.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <CategoryChip category={r.category} className="text-xs text-muted" />
                  </div>
                </div>
                <Badge>{freq[r.frequency]}</Badge>
                <p className="num text-sm text-muted">{r.isActive ? `Next ${formatDate(r.nextRunDate, { day: "numeric", month: "short" })}` : "Paused"}</p>
                <Amount type={r.type} value={r.amount} className="min-w-24 text-right" />
                <Switch checked={r.isActive} onChange={() => toggle(r)} disabled={busyId === r.id} label={`${r.isActive ? "Pause" : "Resume"} ${r.description}`} />
                <Button variant="ghost" size="icon" className="size-8 hover:text-expense" onClick={() => setDeleting(r)} aria-label={`Delete ${r.description}`}>
                  <Trash2 className="size-4" />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <RecurringFormDialog open={open} onClose={() => setOpen(false)} categories={categories} onSubmit={create} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={deletingBusy} title="Delete this recurring rule?" description={deleting ? `"${deleting.description}" will stop generating new transactions. Past transactions stay.` : ""} />
    </>
  );
}
