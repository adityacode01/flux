"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** Shared body for every route-level error.jsx. */
export function RouteError({ reset }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="We couldn't load this page"
      description="Check your connection and try again. Your data is safe."
      action={<Button variant="primary" onClick={reset}>Try again</Button>}
    />
  );
}
