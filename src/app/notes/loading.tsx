// app/notes/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.16)] backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-7 w-20" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <Skeleton className="mt-2 h-3 w-2/3" />
    </div>
  );
}

export default function LoadingNotes() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,#dbe7f3,#c5d7e6_45%,#eef2f7_100%)] px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="mb-2 space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-96" />
        </header>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/50 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-lg">
          <div className="grid gap-8 md:grid-cols-2">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-20" />
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
                <Skeleton className="h-8 w-28" />
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
