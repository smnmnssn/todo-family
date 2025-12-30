// app/calendar/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCalendar() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#c5d7e6] py-8 px-4">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </header>

        <div className="space-y-6">
          {/* Month header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-10 rounded-full" />
              <Skeleton className="h-8 w-10 rounded-full" />
            </div>
          </div>

          {/* Calendar grid card */}
          <div className="rounded-3xl border border-white/60 bg-white/40 p-4 md:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
            {/* Weekdays */}
            <div className="mb-2 grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>

            {/* 6x7 cells */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 42 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Selected day panel */}
          <div className="rounded-3xl border border-white/60 bg-white/40 p-4 md:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>

            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 shadow-sm shadow-slate-900/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-3 w-72" />
                    </div>
                    <Skeleton className="h-7 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
