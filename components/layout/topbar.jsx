"use client";

import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function Topbar({ onAdd }) {
  const router = useRouter();

  // Global search hands off to the transactions page, which filters server-side via ?q=
  function onSearch(e) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    router.push(q ? `/transactions?q=${encodeURIComponent(q)}` : "/transactions");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/70 px-4 backdrop-blur-xl md:px-8">
      <div className="md:hidden">
        <Logo href="/dashboard" />
      </div>
      <form onSubmit={onSearch} role="search" className="relative ml-auto max-w-sm flex-1 md:ml-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input name="q" type="search" aria-label="Search transactions" placeholder="Search transactions" className="pl-9" />
      </form>
      <div className="hidden items-center gap-2 md:ml-auto md:flex">
        <ThemeToggle />
        <Button variant="primary" onClick={onAdd}>
          <Plus className="size-4" />
          Add transaction
        </Button>
      </div>
    </header>
  );
}
