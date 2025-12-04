// app/calendar/MonthView.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ActivityDTO } from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MonthViewProps = {
  year: number;
  month: number; 
  activities: ActivityDTO[];
};

type DayCell = {
  date: Date;
  iso: string; // YYYY-MM-DD
  inCurrentMonth: boolean;
};

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tors", "Fre", "Lör", "Sön"];

function formatIsoDate(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Bygger ett 6x7-grid (42 dagar) med måndag som första veckodag
function buildMonthGrid(year: number, month: number): DayCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  let weekday = firstOfMonth.getUTCDay();
  if (weekday === 0) {
    weekday = 7;
  }

  const daysFromPrevMonth = weekday - 1;
  const firstCellDate = new Date(firstOfMonth);
  firstCellDate.setUTCDate(firstOfMonth.getUTCDate() - daysFromPrevMonth);

  const cells: DayCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const d = new Date(firstCellDate);
    d.setUTCDate(firstCellDate.getUTCDate() + i);
    cells.push({
      date: d,
      iso: formatIsoDate(d),
      inCurrentMonth: d.getUTCMonth() === month - 1,
    });
  }

  return cells;
}

function getMonthName(month: number): string {
  const names = [
    "januari",
    "februari",
    "mars",
    "april",
    "maj",
    "juni",
    "juli",
    "augusti",
    "september",
    "oktober",
    "november",
    "december",
  ];
  return names[month - 1] ?? "";
}

export default function MonthView({ year, month, activities }: MonthViewProps) {
  const router = useRouter();

  const todayIso = React.useMemo(() => formatIsoDate(new Date()), []);

  const cells = React.useMemo(
    () => buildMonthGrid(year, month),
    [year, month],
  );

  const activitiesByDate = React.useMemo(() => {
    const map: Record<string, ActivityDTO[]> = {};

    activities.forEach((activity) => {
      const key = activity.date;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(activity);
    });

    // sortera per dag på startTime/titel
    Object.values(map).forEach((list) =>
      list.sort((a, b) => {
        const aTime = a.startTime ?? "";
        const bTime = b.startTime ?? "";
        if (aTime === bTime) {
          return a.title.localeCompare(b.title, "sv");
        }
        return aTime.localeCompare(bTime);
      }),
    );

    return map;
  }, [activities]);

  const firstCurrentMonthDay = cells.find((c) => c.inCurrentMonth);
  const initialSelectedDate =
    cells.find((c) => c.iso === todayIso && c.inCurrentMonth)?.iso ??
    firstCurrentMonthDay?.iso ??
    todayIso;

  const [selectedDate, setSelectedDate] = React.useState<string>(
    initialSelectedDate,
  );

  const selectedActivities = activitiesByDate[selectedDate] ?? [];

  function goToMonth(nextYear: number, nextMonth: number): void {
    router.push(`/calendar?year=${nextYear}&month=${nextMonth}`);
  }

  function handlePrevMonth(): void {
    let nextYear = year;
    let nextMonth = month - 1;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    goToMonth(nextYear, nextMonth);
  }

  function handleNextMonth(): void {
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    goToMonth(nextYear, nextMonth);
  }

  return (
    <div className="space-y-6">
      {/* Månadshuvud med pilar */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold">
            {getMonthName(month)} {year}
          </h2>
          <p className="text-xs text-muted-foreground">
            Klicka på en dag för att se aktiviteter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={handlePrevMonth}
            aria-label="Föregående månad"
          >
            ‹
          </Button>
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={handleNextMonth}
            aria-label="Nästa månad"
          >
            ›
          </Button>
        </div>
      </div>

      {/* Kalender-grid */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        {/* Veckodagar */}
        <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Datum-rutor */}
        <div className="grid grid-cols-7 gap-1 text-sm">
          {cells.map((cell) => {
            const dayNumber = cell.date.getUTCDate();
            const hasActivities = Boolean(activitiesByDate[cell.iso]);
            const isToday = cell.iso === todayIso;
            const isSelected = cell.iso === selectedDate;

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setSelectedDate(cell.iso)}
                className={cn(
                  "flex h-16 flex-col items-center justify-between rounded-md border px-1 py-1.5 text-xs transition-colors",
                  !cell.inCurrentMonth &&
                    "bg-muted/40 text-muted-foreground border-transparent",
                  cell.inCurrentMonth &&
                    "bg-background hover:bg-accent hover:text-accent-foreground",
                  isSelected &&
                    "border-primary ring-2 ring-primary/30 bg-primary/5",
                  isToday && !isSelected && "border-primary/60",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span>{dayNumber}</span>
                  {isToday && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      Idag
                    </span>
                  )}
                </div>

                <div className="flex w-full flex-wrap justify-center gap-0.5">
                  {hasActivities &&
                    (activitiesByDate[cell.iso] ?? [])
                      .slice(0, 3)
                      .map((activity) => (
                        <span
                          key={activity.id}
                          className="mt-1 h-1.5 w-1.5 rounded-full bg-primary"
                        />
                      ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista med aktiviteter för vald dag */}
      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">
              Aktiviteter {selectedDate}
            </h3>
            <p className="text-xs text-muted-foreground">
              Här visas alla aktiviteter för den valda dagen.
            </p>
          </div>

          <Button type="button" size="sm">
            Ny aktivitet
          </Button>
        </header>

        {selectedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <div className="rounded-full bg-muted p-2">
              <span className="text-lg text-muted-foreground">＋</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Inga aktiviteter denna dag ännu.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {selectedActivities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
              >
                <div className="space-y-0.5">
                  <p className="font-medium">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {activity.allDay ? (
                    <span>Hela dagen</span>
                  ) : (
                    <span>
                      {activity.startTime ?? "—"}
                      {activity.endTime ? `–${activity.endTime}` : ""}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
