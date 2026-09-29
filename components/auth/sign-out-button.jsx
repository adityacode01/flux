"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} aria-label="Sign out" className="text-muted transition-colors hover:text-fg">
      <LogOut className="size-4" />
    </button>
  );
}
