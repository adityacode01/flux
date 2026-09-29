"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { primaryNav, secondaryNav } from "@/lib/navigation";

function NavLink({ href, label, icon: Icon }) {
  const active = usePathname().startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-surface-2 font-medium text-fg" : "text-muted hover:bg-surface hover:text-fg",
      )}
    >
      <Icon className={cn("size-4", active && "text-accent")} />
      {label}
    </Link>
  );
}

export function Sidebar({ user }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line px-3 py-5 md:flex">
      <div className="px-3 pb-6">
        <Logo href="/dashboard" />
      </div>
      <nav className="space-y-0.5" aria-label="Main">
        {primaryNav.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
      <nav className="mt-6 space-y-0.5 border-t border-line pt-6" aria-label="Manage">
        {secondaryNav.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/20 text-sm font-semibold text-accent">{user.name[0]}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
