import Link from "next/link";
import { Suspense } from "react";
import { getOverviewData } from "@/app/(app)/overview/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "short",
  }).format(d);
}

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}


function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function OverviewSkeleton() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="glass-surface lg:col-span-12">
          <CardHeader>
            <CardTitle>
              <SkeletonBlock className="h-6 w-56" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SkeletonBlock className="h-4 w-80" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Todos</CardTitle>
            <SkeletonBlock className="h-8 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>

        <Card className="glass-surface lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Checklistor</CardTitle>
            <SkeletonBlock className="h-8 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonBlock className="h-5 w-40" />
                {Array.from({ length: 5 }).map((__, j) => (
                  <SkeletonBlock key={j} className="h-8 w-full" />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-surface lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Anteckningar</CardTitle>
            <SkeletonBlock className="h-8 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel = "Visa alla",
}: {
  title: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between gap-3">
      <CardTitle className="text-base font-semibold tracking-tight text-slate-900">
        {title}
      </CardTitle>
      <Button asChild variant="outline" size="sm" className="bg-white/40">
        <Link href={href}>{linkLabel}</Link>
      </Button>
    </CardHeader>
  );
}

async function OverviewContent() {
  const data = await getOverviewData();

  return (
<div className="rounded-[32px] border border-white/40 bg-white/10 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
  <div className="w-full space-y-6">
    {/* HERO / TOP */}
    <Card className="glass-surface">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
            Översikt
          </CardTitle>
          <p className="mt-1 text-sm text-slate-700/80">
            Vecka: {formatDate(data.week.start)} – {formatDate(data.week.end)}
          </p>
        </div>

        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/40 bg-white/20 text-slate-900 shadow-sm backdrop-blur-md hover:bg-white/30"
          >
            <Link href="/calendar">Kalender</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/40 bg-white/20 text-slate-900 shadow-sm backdrop-blur-md hover:bg-white/30"
          >
            <Link href="/todos">Todos</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/40 bg-white/20 text-slate-900 shadow-sm backdrop-blur-md hover:bg-white/30"
          >
            <Link href="/notes">Listor & anteckningar</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* “Next up” */}
        <div className="rounded-2xl border border-white/40 bg-white/15 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md">
  <p className="text-sm font-medium text-slate-900">
    Kommande aktiviteter denna vecka
  </p>

  {data.activities.length === 0 ? (
    <p className="mt-1 text-sm text-slate-700/80">
      Inga aktiviteter denna vecka ännu.
    </p>
  ) : (
    <p className="mt-1 text-sm text-slate-700/80">
      {data.activities.length} st
    </p>
  )}
</div>

        {/* Activity chips */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {data.activities.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-white/40 bg-white/15 p-4 text-sm text-slate-700/80 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md">
              Lägg till en aktivitet i kalendern för att se den här.
            </div>
          ) : (
            data.activities.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-white/40 bg-white/15 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.10)] backdrop-blur-md transition hover:bg-white/25"
              >
                <p className="truncate text-sm font-medium text-slate-900">
                  {a.title}
                </p>
                <p className="text-xs text-slate-700/80">
                  {formatDate(a.startsAt)}
                  {a.allDay ? " • Heldag" : a.hasTime ? ` • ${formatTime(a.startsAt)}` : ""}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>

    {/* GRID */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* TODOS */}
      <Card className="glass-surface lg:col-span-4">
        <SectionHeader title="Todos" href="/todos" />

        <CardContent className="space-y-2">
          {data.todos.length === 0 ? (
            <div className="rounded-2xl border border-white/40 bg-white/15 p-4 text-sm text-slate-700/80 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md">
              Inga todos ännu. Skapa en på Todos-sidan.
            </div>
          ) : (
            <ul className="space-y-2">
              {data.todos.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/15 px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.10)] backdrop-blur-md transition hover:bg-white/25"
                >
                  <div className="min-w-0">
                    {t.listTitle ? (
                      <p className="text-xs text-slate-700/80">{t.listTitle}</p>
                    ) : null}

                    <p
                      className={`truncate text-sm ${
                        t.completed
                          ? "line-through text-slate-600/80"
                          : "font-medium text-slate-900"
                      }`}
                    >
                      {t.title}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                      t.completed
                        ? "bg-white/25 text-slate-700/80"
                        : "bg-sky-500/20 text-sky-900"
                    }`}
                  >
                    {t.completed ? "Klar" : "Pågår"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* CHECKLISTS */}
      <Card className="glass-surface lg:col-span-4">
        <SectionHeader title="Checklistor" href="/notes" />

        <CardContent className="space-y-4">
          {data.checklists.length === 0 ? (
            <div className="rounded-2xl border border-white/40 bg-white/15 p-4 text-sm text-slate-700/80 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md">
              Inga checklistor ännu. Skapa en på Checklists-sidan.
            </div>
          ) : (
            data.checklists.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-white/40 bg-white/15 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {c.title}
                    </p>
                    <p className="text-xs text-slate-700/80">
                      {c.remainingCount} kvar • {c.totalCount} totalt
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-white/40 bg-white/20 px-3 text-xs text-slate-900 shadow-sm backdrop-blur-md hover:bg-white/30"
                  >
                    <Link href="/notes">Öppna</Link>
                  </Button>
                </div>

                <div className="mt-3 space-y-2">
                  {c.sampleItems.length === 0 ? (
                    <p className="text-xs text-slate-700/80">
                      Inga rader i denna lista ännu.
                    </p>
                  ) : (
                    c.sampleItems.map((i) => (
                      <div
                        key={i.id}
                        className="flex items-center justify-between rounded-xl border border-white/40 bg-white/10 px-2 py-1.5 text-sm shadow-[0_10px_22px_rgba(15,23,42,0.08)] backdrop-blur-md"
                      >
                        <span
                          className={`truncate ${
                            i.checked
                              ? "line-through text-slate-600/80"
                              : "text-slate-900"
                          }`}
                        >
                          {i.text}
                        </span>
                        <span className="ml-3 text-xs text-slate-700/80">
                          {i.checked ? "Klar" : "Ej klar"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* NOTES */}
      <Card className="glass-surface lg:col-span-4">
        <SectionHeader title="Anteckningar" href="/notes" />

        <CardContent className="space-y-3">
          {data.notes.length === 0 ? (
            <div className="rounded-2xl border border-white/40 bg-white/15 p-4 text-sm text-slate-700/80 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md">
              Inga anteckningar ännu. Skapa en på Notes-sidan.
            </div>
          ) : (
            data.notes.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl border border-white/40 bg-white/15 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.10)] backdrop-blur-md transition hover:bg-white/25"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {n.title?.trim() ? n.title : "Anteckning"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700/80">{n.excerpt}</p>
                  </div>
                  <span className="text-xs text-slate-700/80">
                    {formatDate(n.updatedAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  </div>
    </div>

);

}

export default function OverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContent />
    </Suspense>
  );
}
