"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Ellipsis, LogOut, Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { primaryNav, secondaryNav } from "@/lib/navigation";

function Tab({ href, label, icon: Icon }) {
  const active = usePathname().startsWith(href);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex flex-1 flex-col items-center gap-1 py-2 text-[11px]", active ? "text-fg" : "text-muted")}>
      <Icon className={cn("size-5", active && "text-accent")} />
      {label}
    </Link>
  );
}

export function MobileNav({ onAdd }) {
  const [more, setMore] = useState(false);
  const [a, b, c, d] = primaryNav;

  return (
    <>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t border-line bg-bg/85 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <Tab {...a} />
        <Tab {...b} />
        <button onClick={onAdd} aria-label="Add transaction" className="-mt-6 grid size-14 shrink-0 place-items-center rounded-full bg-fg text-bg shadow-lg transition-transform active:scale-95">
          <Plus className="size-6" />
        </button>
        <Tab {...c} />
        <button onClick={() => setMore(true)} className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] text-muted">
          <Ellipsis className="size-5" />
          More
        </button>
      </nav>

      <Dialog open={more} onClose={() => setMore(false)} title="More">
        <div className="space-y-1">
          {[d, ...secondaryNav].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setMore(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-surface-2">
              <Icon className="size-4 text-muted" />
              {label}
            </Link>
          ))}
          <div className="flex items-center justify-between border-t border-line px-3 pt-3">
            <span className="text-sm text-muted">Theme</span>
            <ThemeToggle />
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-expense hover:bg-surface-2">
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </Dialog>
    </>
  );
}
