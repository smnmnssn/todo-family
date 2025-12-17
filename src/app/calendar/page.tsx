// app/calendar/page.tsx
import MonthView from "../../components/calendar/MonthView";
import type { ActivityDTO } from "./actions";
import { getActivitiesForMonth } from "./actions";

type CalendarSearchParams = {
  year?: string;
  month?: string;
};

type CalendarPageProps = {
  searchParams: Promise<CalendarSearchParams>;
};

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
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

  const month = Math.min(Math.max(rawMonth, 1), 12); // clamp 1–12

  const result = await getActivitiesForMonth({ year, month });

  if (!result.success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#c5d7e6] py-8 px-4">
        <div className="mx-auto max-w-5xl">
          <p className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {result.error}
          </p>
        </div>
      </div>
    );
  }

  const activities: ActivityDTO[] = result.data;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#c5d7e6] py-8 px-4">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-[#3b4a5c]">Kalender</h1>
          <p className="text-sm text-slate-600">
            Se familjens aktiviteter månadsvis.
          </p>
        </header>

        <MonthView year={year} month={month} activities={activities} />
      </div>
    </div>
  );
}
