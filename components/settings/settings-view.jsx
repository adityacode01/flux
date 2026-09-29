"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/components/providers/theme-provider";
import { updateProfile } from "@/lib/api/user";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function SettingsView({ user }) {
  const { toast } = useToast();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [currency, setCurrency] = useState(user.currency);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (!name.trim()) return setError("Name can't be empty");
    setError("");
    setSaving(true);
    try {
      await updateProfile({ name, currency });
      toast({ title: "Profile saved" });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError && err.details?.name) setError(err.details.name[0]);
      else toast({ variant: "error", title: "Couldn't save profile", description: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader title="Profile" />
        <form onSubmit={save} className="space-y-4 p-5" noValidate>
          <Field label="Name" error={error}>{(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />}</Field>
          <Field label="Email" hint="Your sign-in email can't be changed yet.">{(p) => <Input {...p} value={user.email} disabled />}</Field>
          <Field label="Currency" hint="Amounts are formatted with Indian digit grouping.">
            {(p) => (
              <Select {...p} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="INR">Indian rupee (₹)</option>
                <option value="USD">US dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </Select>
            )}
          </Field>
          <Button type="submit" variant="primary" loading={saving}>Save changes</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Appearance" />
        <div className="grid grid-cols-2 gap-3 p-5">
          {["dark", "light"].map((t) => (
            <button key={t} onClick={() => theme !== t && toggle()} aria-pressed={theme === t} className={cn("rounded-lg border p-4 text-left text-sm transition-colors", theme === t ? "border-accent bg-accent/10" : "border-line hover:bg-surface-2")}>
              <span className="font-medium capitalize">{t}</span>
              <span className="mt-0.5 block text-muted">{t === "dark" ? "Default" : "Bright surfaces"}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
