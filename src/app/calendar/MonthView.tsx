// app/calendar/MonthView.tsx
"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import type { ActivityDTO } from "./actions";
import { CreateActivityDialog } from "./CreateActivityDialog";
import { EditActivityDialog } from "./EditActivityDialog";

import { cn } from "@/lib/utils";

type MonthViewProps = {
  year: number;
  month: number; // 1–12
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

function buildMonthGrid(year: number, month: number): DayCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  let weekday = firstOfMonth.getUTCDay(); // 0 = sön, 1 = mån, ...
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
  const pathname = usePathname();

  const todayIso = React.useMemo(() => formatIsoDate(new Date()), []);

  const cells = React.useMemo(() => buildMonthGrid(year, month), [year, month]);

  // activity map per datum
  const activitiesByDate = React.useMemo(() => {
    const map: Record<string, ActivityDTO[]> = {};

    activities.forEach((activity: ActivityDTO) => {
      const key = activity.date;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(activity);
    });

    Object.values(map).forEach((list) =>
      list.sort((a, b) => {
        const aTime = a.startTime ?? "";
        const bTime = b.startTime ?? "";
        if (aTime === bTime) {
          return a.title.localeCompare(b.title, "sv");
        }
        return aTime.localeCompare(bTime);
      })
    );

    return map;
  }, [activities]);

  const firstCurrentMonthDay = cells.find((c) => c.inCurrentMonth);
  const initialSelectedDate =
    cells.find((c) => c.iso === todayIso && c.inCurrentMonth)?.iso ??
    firstCurrentMonthDay?.iso ??
    todayIso;

  const [selectedDate, setSelectedDate] =
    React.useState<string>(initialSelectedDate);

  const selectedActivities: ActivityDTO[] =
    activitiesByDate[selectedDate] ?? [];

  function goToMonth(nextYear: number, nextMonth: number): void {
    const search = new URLSearchParams();
    search.set("year", String(nextYear));
    search.set("month", String(nextMonth));
    router.push(`${pathname}?${search.toString()}`);
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
      {/* Månadsheader med pilar */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold text-[#3b4a5c] capitalize">
            {getMonthName(month)} {year}
          </h2>
          <p className="text-xs text-slate-600">
            Klicka på en dag för att se aktiviteter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded-full border border-white/70 bg-white/60 px-3 py-1 text-sm text-[#567A98] backdrop-blur hover:bg-white"
            aria-label="Föregående månad"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-full border border-white/70 bg-white/60 px-3 py-1 text-sm text-[#567A98] backdrop-blur hover:bg-white"
            aria-label="Nästa månad"
          >
            ›
          </button>
        </div>
      </div>

      {/* Kalenderkort (glas) */}
      <div className="rounded-3xl border border-white/60 bg-white/40 p-4 md:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
        {/* Veckodagar */}
        <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-[#567A98]">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Datumrutor */}
        <div className="grid grid-cols-7 gap-2 text-sm">
          {cells.map((cell) => {
            const dayNumber = cell.date.getUTCDate();
            const dayActivities: ActivityDTO[] =
              activitiesByDate[cell.iso] ?? [];
            const hasActivities = dayActivities.length > 0;
            const isToday = cell.iso === todayIso;
            const isSelected = cell.iso === selectedDate;

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setSelectedDate(cell.iso)}
                className={cn(
                  "flex h-16 flex-col items-center justify-between rounded-2xl border border-white/50 bg-white/60 px-2 py-1.5 text-xs shadow-sm shadow-slate-900/10 backdrop-blur-md transition-colors",
                  !cell.inCurrentMonth &&
                    "border-transparent bg-white/30 text-slate-400",
                  cell.inCurrentMonth && "hover:bg-white/80",
                  isSelected &&
                    "border-[#8FAEC9] ring-2 ring-[#8FAEC9]/40 bg-white",
                  isToday && !isSelected && "border-[#8FAEC9]"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span>{dayNumber}</span>
                  {isToday && (
                    <span className="rounded-full bg-[#8FAEC9]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#567A98]">
                      Idag
                    </span>
                  )}
                </div>

                <div className="flex w-full flex-wrap justify-center gap-0.5">
                  {hasActivities &&
                    dayActivities
                      .slice(0, 3)
                      .map((activity) => (
                        <span
                          key={activity.id}
                          className="mt-1 h-1.5 w-1.5 rounded-full bg-[#567A98]"
                        />
                      ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista med aktiviteter för vald dag */}
      <section className="rounded-3xl border border-white/60 bg-white/40 p-4 md:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[#3b4a5c]">
              Aktiviteter {selectedDate}
            </h3>
            <p className="text-xs text-slate-600">
              Här visas alla aktiviteter för den valda dagen.
            </p>
          </div>

          <CreateActivityDialog date={selectedDate} />
        </header>

        {selectedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <div className="rounded-full bg-white/60 p-2 shadow-sm shadow-slate-900/10">
              <span className="text-lg text-[#567A98]">＋</span>
            </div>
            <p className="text-xs text-slate-600">
              Inga aktiviteter denna dag ännu.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {selectedActivities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between rounded-xl border border-white/60 bg-white/80 px-3 py-2 shadow-sm shadow-slate-900/5"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-[#3b4a5c]">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-slate-600">
                      {activity.description}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-slate-500">
                  {activity.allDay ? (
                    <span>Hela dagen</span>
                  ) : (
                    <span>
                      {activity.startTime ?? "—"}
                      {activity.endTime ? `–${activity.endTime}` : ""}
                    </span>
                  )}

                  <EditActivityDialog activity={activity} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
