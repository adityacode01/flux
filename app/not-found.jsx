import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="num font-display text-6xl font-semibold">404</p>
        <p className="mt-3 text-muted">That page doesn&apos;t exist or has moved.</p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button variant="primary">Go to dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
