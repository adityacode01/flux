"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { useToast } from "@/components/ui/toast";
import { createTransaction } from "@/lib/api/transactions";
import { listCategories } from "@/lib/api/categories";

const QuickAddContext = createContext(() => {});
export const useQuickAdd = () => useContext(QuickAddContext);

// Fired after the quick-add dialog saves, so any page showing transactions can refresh itself.
export const TRANSACTION_CREATED_EVENT = "flux:transaction-created";

export function AppShell({ user, children }) {
  const [adding, setAdding] = useState(false);
  const [categories, setCategories] = useState([]);
  const { toast } = useToast();
  const router = useRouter();

  const open = useCallback(async () => {
    if (categories.length === 0) {
      try {
        setCategories(await listCategories());
      } catch {
        toast({ variant: "error", title: "Couldn't load categories" });
        return;
      }
    }
    setAdding(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  async function create(values) {
    await createTransaction(values);
    toast({ title: "Transaction added", description: values.description });
    window.dispatchEvent(new Event(TRANSACTION_CREATED_EVENT));
    router.refresh(); // updates server-rendered pages (dashboard, budgets, etc.)
  }

  return (
    <QuickAddContext.Provider value={open}>
      <Sidebar user={user} />
      <div className="md:pl-60">
        <Topbar onAdd={open} />
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">{children}</main>
      </div>
      <MobileNav onAdd={open} />
      <TransactionFormDialog open={adding} onClose={() => setAdding(false)} categories={categories} onSubmit={create} />
    </QuickAddContext.Provider>
  );
}
