import Link from "next/link";
import { Suspense } from "react";
import { getOverviewData } from "@/app/overview/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
  }).format(d);
}

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function OverviewSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-12">
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

        <Card className="lg:col-span-4">
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

        <Card className="lg:col-span-4">
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

        <Card className="lg:col-span-4">
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

async function OverviewContent() {
  const data = await getOverviewData();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-12">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Översikt</CardTitle>
              <p className="text-sm text-muted-foreground">
                Vecka: {formatDate(data.week.start)} –{" "}
                {formatDate(data.week.end)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/calendar">Kalender</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/todos">Todos</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/notes">Anteckningar</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3">
              {data.activities.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Kommande denna vecka</p>
                  <p className="text-sm text-muted-foreground">
                    Nästa: {data.activities[0].title}{" "}
                    {formatTime(data.activities[0].startsAt)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Inga aktiviteter denna vecka ännu.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {data.activities.length === 0 ? (
                <div className="col-span-full rounded-lg border p-3 text-sm text-muted-foreground">
                  Lägg till en aktivitet i kalendern för att se den här.
                </div>
              ) : (
                data.activities.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg border bg-background p-3"
                  >
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(a.startsAt)} • {formatTime(a.startsAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Todos</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/todos">Visa alla</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-2">
            {data.todos.length === 0 ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                Inga todos ännu. Skapa en på Todos-sidan.
              </div>
            ) : (
              <ul className="space-y-2">
                {data.todos.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm ${
                          t.completed
                            ? "line-through text-muted-foreground"
                            : "font-medium"
                        }`}
                      >
                        {t.title}
                      </p>
                      {t.listTitle ? (
                        <p className="text-xs text-muted-foreground">
                          {t.listTitle}
                        </p>
                      ) : null}
                    </div>

                    <span
                      className={`ml-3 inline-flex h-5 items-center rounded-full px-2 text-xs ${
                        t.completed
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary"
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

        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Checklistor</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/notes">Visa alla</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {data.checklists.length === 0 ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                Inga checklistor ännu. Skapa en på Checklists-sidan.
              </div>
            ) : (
              data.checklists.map((c) => (
                <div key={c.id} className="rounded-lg border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.remainingCount} kvar • {c.totalCount} totalt
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/notes">Öppna</Link>
                    </Button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {c.sampleItems.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Inga rader i denna lista ännu.
                      </p>
                    ) : (
                      c.sampleItems.map((i) => (
                        <div
                          key={i.id}
                          className="flex items-center justify-between rounded-md border px-2 py-1.5 text-sm"
                        >
                          <span
                            className={`truncate ${
                              i.checked
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {i.text}
                          </span>
                          <span className="ml-3 text-xs text-muted-foreground">
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

        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Anteckningar</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/notes">Visa alla</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.notes.length === 0 ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                Inga anteckningar ännu. Skapa en på Notes-sidan.
              </div>
            ) : (
              data.notes.map((n) => (
                <div key={n.id} className="rounded-lg border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {n.title?.trim() ? n.title : "Anteckning"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {n.excerpt}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
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
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContent />
    </Suspense>
  );
}
