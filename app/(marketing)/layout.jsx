import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="hidden gap-8 text-sm text-muted md:flex" aria-label="Sections">
            <a href="#features" className="transition-colors hover:text-fg">Features</a>
            <a href="#preview" className="transition-colors hover:text-fg">Preview</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block"><Button variant="ghost">Log in</Button></Link>
            <Link href="/register"><Button variant="primary">Get started</Button></Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center">
          <Logo />
          <p>© {new Date().getFullYear()} Flux. Built for tracking money in ₹.</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-fg">Log in</Link>
            <Link href="/register" className="hover:text-fg">Create account</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
