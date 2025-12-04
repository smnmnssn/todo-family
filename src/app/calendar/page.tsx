// app/calendar/page.tsx
import MonthView from "./MonthView";
import type { ActivityDTO } from "./actions";
import { getActivitiesForMonth } from "./actions";

type CalendarSearchParams = {
  year?: string;
  month?: string;
};

type CalendarPageProps = {
  searchParams: Promise<CalendarSearchParams>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;

  const today = new Date();

  const yearParam = params.year;
  const monthParam = params.month;

  const year =
    yearParam !== undefined && !Number.isNaN(Number(yearParam))
      ? Number(yearParam)
      : today.getFullYear();

  const rawMonth =
    monthParam !== undefined && !Number.isNaN(Number(monthParam))
      ? Number(monthParam)
      : today.getMonth() + 1;

  const month = Math.min(Math.max(rawMonth, 1), 12); 

  const result = await getActivitiesForMonth({ year, month });

  if (!result.success) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {result.error}
        </p>
      </div>
    );
  }

  const activities: ActivityDTO[] = result.data;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Kalender</h1>
        <p className="text-sm text-muted-foreground">
          Se familjens aktiviteter månadsvis.
        </p>
      </header>

      <MonthView year={year} month={month} activities={activities} />
    </div>
  );
}
