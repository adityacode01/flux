"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createCategory } from "@/lib/api/categories";
import { ApiClientError } from "@/lib/api/client";
import { iconFor, iconNames } from "@/lib/icons";
import { cn } from "@/lib/utils";

const swatches = ["#f59e0b", "#38bdf8", "#f472b6", "#a78bfa", "#34d399", "#fb7185", "#2dd4bf", "#facc15", "#818cf8", "#94a3b8"];
const typeLabel = { EXPENSE: "Expense", INCOME: "Income" };

export function CategoriesView({ initial }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "EXPENSE", icon: "tag", color: swatches[0] });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return setError("Give the category a name");
    setError("");
    setSaving(true);
    try {
      const category = await createCategory({ ...form, name, type: form.type || null });
      setItems((list) => [...list, category]);
      toast({ title: "Category created", description: name });
      setForm({ name: "", type: "EXPENSE", icon: "tag", color: swatches[0] });
      setOpen(false);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) setError("You already have a category with this name");
      else if (err instanceof ApiClientError && err.details?.name) setError(err.details.name[0]);
      else toast({ variant: "error", title: "Couldn't create category", description: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="-mt-2 mb-6 flex justify-end">
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New category
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((c) => {
          const Icon = iconFor(c.icon);
          return (
            <Card key={c.id} className="flex items-center gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg" style={{ background: `${c.color}22`, color: c.color }}>
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <Badge className="mt-1">{c.type ? typeLabel[c.type] : "Any"}</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="New category">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Name" error={error}>
            {(p) => <Input {...p} value={form.name} maxLength={40} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pets" />}
          </Field>
          <Field label="Used for">
            {(p) => (
              <Select {...p} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="EXPENSE">Expenses</option>
                <option value="INCOME">Income</option>
                <option value="">Both</option>
              </Select>
            )}
          </Field>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Icon</legend>
            <div className="flex flex-wrap gap-2">
              {iconNames.map((n) => {
                const Icon = iconFor(n);
                return (
                  <button key={n} type="button" aria-label={n} aria-pressed={form.icon === n} onClick={() => setForm({ ...form, icon: n })} className={cn("grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-fg", form.icon === n && "border-accent bg-accent/10 text-accent")}>
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Color</legend>
            <div className="flex flex-wrap gap-2">
              {swatches.map((s) => (
                <button key={s} type="button" aria-label={`Color ${s}`} aria-pressed={form.color === s} onClick={() => setForm({ ...form, color: s })} className={cn("size-7 rounded-full ring-offset-2 ring-offset-bg transition-shadow", form.color === s && "ring-2 ring-fg")} style={{ background: s }} />
              ))}
            </div>
          </fieldset>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Create category</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
