import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="mb-6 h-9 w-56" />
      <Skeleton className="h-24" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14" />
      ))}
    </div>
  );
}