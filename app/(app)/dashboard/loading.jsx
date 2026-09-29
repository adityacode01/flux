import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="mb-6 h-9 w-72" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem] lg:h-full" />
          ))}
        </div>
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
