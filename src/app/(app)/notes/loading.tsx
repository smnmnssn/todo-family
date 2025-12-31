// app/notes/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-white/40 bg-white/10 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <Skeleton className="mt-2 h-3 w-2/3" />
    </div>
  );
}

export default function LoadingNotes() {
  return (
    <div className="w-full p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-[32px] border border-white/40 bg-white/10 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
          <header className="mb-6 space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-96" />
          </header>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-9 w-28 rounded-full" />
              </div>

              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-9 w-32 rounded-full" />
              </div>

              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
