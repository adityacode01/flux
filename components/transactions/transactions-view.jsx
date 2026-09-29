"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowLeftRight, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Amount, CategoryChip, TypeBadge } from "./transaction-row";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { TRANSACTION_CREATED_EVENT, useQuickAdd } from "@/components/layout/app-shell";
import { createTransaction, deleteTransaction, listTransactions, updateTransaction } from "@/lib/api/transactions";
import { ApiClientError } from "@/lib/api/client";
import { formatDate } from "@/lib/money";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 350;

export function TransactionsView({ initial, categories, initialFilters }) {
  const { toast } = useToast();
  const openAdd = useQuickAdd();
  const [result, setResult] = useState(initial);
  const [q, setQ] = useState(initialFilters.q);
  const [type, setType] = useState(initialFilters.type);
  const [categoryId, setCategoryId] = useState(initialFilters.categoryId);
  const [from, setFrom] = useState(initialFilters.from);
  const [to, setTo] = useState(initialFilters.to);
  const [sort, setSort] = useState({ by: "date", dir: "desc" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const requestId = useRef(0);

  const query = { q, type, categoryId, from, to, sortBy: sort.by, order: sort.dir, page, pageSize: 8 };

  const fetchList = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const data = await listTransactions(query);
      if (id === requestId.current) setResult(data);
    } catch (err) {
      if (id === requestId.current) toast({ variant: "error", title: "Couldn't load transactions", description: err.message });
    } finally {
      if (id === requestId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type, categoryId, from, to, sort.by, sort.dir, page]);

  // Search is debounced; every other filter/sort/page change refetches right away.
  useEffect(() => {
    const t = setTimeout(fetchList, q !== initialFilters.q ? DEBOUNCE_MS : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type, categoryId, from, to, sort.by, sort.dir, page]);

  // Picks up transactions added via the quick-add button in the topbar/mobile nav.
  useEffect(() => {
    window.addEventListener(TRANSACTION_CREATED_EVENT, fetchList);
    return () => window.removeEventListener(TRANSACTION_CREATED_EVENT, fetchList);
  }, [fetchList]);

  const items = result.items;
  const hasFilters = q || type || categoryId || from || to;
  const reset = () => (setQ(""), setType(""), setCategoryId(""), setFrom(""), setTo(""), setPage(1));
  const filter = (setter) => (e) => (setter(e.target.value), setPage(1));
  const toggleSort = (by) => (setSort((s) => (s.by === by ? { by, dir: s.dir === "asc" ? "desc" : "asc" } : { by, dir: "desc" })), setPage(1));

  async function save(values) {
    try {
      if (editing) {
        await updateTransaction(editing.id, values);
        toast({ title: "Changes saved", description: values.description });
      } else {
        await createTransaction(values);
        toast({ title: "Transaction added", description: values.description });
      }
      await fetchList();
    } catch (err) {
      if (err instanceof ApiClientError && err.details) throw err; // let the dialog show field errors
      toast({ variant: "error", title: "Couldn't save transaction", description: err.message });
      throw err;
    }
  }

  async function remove() {
    setDeletingBusy(true);
    try {
      await deleteTransaction(deleting.id);
      toast({ title: "Transaction deleted", description: deleting.description });
      setDeleting(null);
      await fetchList();
    } catch (err) {
      toast({ variant: "error", title: "Couldn't delete transaction", description: err.message });
    } finally {
      setDeletingBusy(false);
    }
  }

  const SortIcon = ({ by }) => sort.by === by && (sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />);
  const actions = (t) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditing(t)} aria-label={`Edit ${t.description}`}>
        <Pencil className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" className="size-8 hover:text-expense" onClick={() => setDeleting(t)} aria-label={`Delete ${t.description}`}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );

  return (
    <>
      <Card className="mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={filter(setQ)} placeholder="Search description or category" aria-label="Search" className="pl-9" />
        </div>
        <Select value={type} onChange={filter(setType)} aria-label="Type">
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </Select>
        <Select value={categoryId} onChange={filter(setCategoryId)} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Input type="date" value={from} onChange={filter(setFrom)} aria-label="From date" />
        <Input type="date" value={to} onChange={filter(setTo)} aria-label="To date" />
      </Card>

      {loading && items.length === 0 ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title={hasFilters ? "No transactions match these filters" : "No transactions yet"}
          description={hasFilters ? "Try a wider date range or clear a filter." : "Add your first income or expense to start tracking."}
          action={hasFilters ? <Button onClick={reset}>Clear filters</Button> : <Button variant="primary" onClick={openAdd}><Plus className="size-4" />Add transaction</Button>}
        />
      ) : (
        <>
          <Card className={cn("hidden overflow-hidden md:block", loading && "opacity-60")}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  <th className="px-5 py-3 font-medium">
                    <button onClick={() => toggleSort("date")} className="inline-flex items-center gap-1 hover:text-fg">Date <SortIcon by="date" /></button>
                  </th>
                  <th className="px-3 py-3 font-medium">Description</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 text-right font-medium">
                    <button onClick={() => toggleSort("amount")} className="inline-flex items-center gap-1 hover:text-fg">Amount <SortIcon by="amount" /></button>
                  </th>
                  <th className="w-24 px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-surface-2/60">
                    <td className="num whitespace-nowrap px-5 py-3 text-muted">{formatDate(t.date)}</td>
                    <td className="px-3 py-3 font-medium">{t.description}</td>
                    <td className="px-3 py-3"><CategoryChip category={t.category} /></td>
                    <td className="px-3 py-3"><TypeBadge type={t.type} /></td>
                    <td className="px-3 py-3 text-right"><Amount type={t.type} value={t.amount} /></td>
                    <td className="px-5 py-3">{actions(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <ul className={cn("space-y-2 md:hidden", loading && "opacity-60")}>
            {items.map((t) => (
              <li key={t.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.description}</p>
                      <p className="num mt-0.5 text-xs text-muted">{formatDate(t.date)}</p>
                    </div>
                    <Amount type={t.type} value={t.amount} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <CategoryChip category={t.category} />
                    {actions(t)}
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <p>{result.total} transaction{result.total === 1 ? "" : "s"}</p>
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><ChevronLeft className="size-4" /></Button>
              <span className="num min-w-16 text-center">{result.page} / {result.totalPages}</span>
              <Button size="sm" disabled={page >= result.totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight className="size-4" /></Button>
            </div>
          </div>
        </>
      )}

      <TransactionFormDialog open={!!editing} onClose={() => setEditing(null)} categories={categories} transaction={editing} onSubmit={save} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={deletingBusy} title="Delete this transaction?" description={deleting ? `"${deleting.description}" will be permanently removed.` : ""} />
    </>
  );
}
