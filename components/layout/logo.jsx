import Link from "next/link";

export function Logo({ href = "/" }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
        <path d="M3 17c4 0 4-10 9-10s5 10 9 10" stroke="url(#lg)" strokeWidth="2.6" strokeLinecap="round" />
        <defs>
          <linearGradient id="lg" x1="3" x2="21" y1="0" y2="0">
            <stop stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
      </svg>
      Flux
    </Link>
  );
}
