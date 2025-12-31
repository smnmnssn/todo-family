// app/calendar/page.tsx
import MonthView from "../../../components/calendar/MonthView";
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
  <div className="w-full p-4 md:p-8">
    <div className="mx-auto w-full max-w-6xl">
      <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive shadow-[0_10px_24px_rgba(15,23,42,0.10)] backdrop-blur-md">
        {result.error}
      </p>
    </div>
  </div>
);

  }

  const activities: ActivityDTO[] = result.data;

  return (
  <div className="w-full p-4 md:p-8">
    <div className="mx-auto w-full max-w-6xl">
      <MonthView year={year} month={month} activities={activities} />
    </div>
  </div>
);

}
