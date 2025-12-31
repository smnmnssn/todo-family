// app/todos/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

function TodoCardSkeleton() {
  return (
    <div className="rounded-3xl border border-white/40 bg-white/10 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/25 bg-white/5 px-4 py-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {Array.from({ length: 5 }).map((_, j) => (
          <div
            key={j}
            className="flex items-center justify-between gap-2 rounded-2xl border border-white/30 bg-white/10 px-2.5 py-2"
          >
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-[70%]" />
            </div>
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoadingTodos() {
  return (
    <div className="w-full p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-[32px] border border-white/40 bg-white/10 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TodoCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
