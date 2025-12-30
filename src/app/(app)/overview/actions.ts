"use server";

import { unstable_noStore as noStore } from "next/cache";
import { getActivitiesForMonth } from "@/app/(app)/calendar/actions";
import { getTodoLists } from "@/app/(app)/todos/actions";
import { getChecklists } from "@/app/(app)/checklists/actions";
import { getNotes } from "@/app/(app)/notes/actions";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function unwrap<T>(res: ActionResult<T>, fallback: T): T {
  if (res.success) return res.data;
  console.error("Overview fetch failed:", res.error);
  return fallback;
}

export type OverviewActivityPreview = {
  id: string;
  title: string;
  startsAt: Date;         // används för sortering + formatDate (datum)
  allDay: boolean;        // bara true om checkbox kryssats
  hasTime: boolean;       // true bara om användaren valt en startTime
};



export type OverviewTodoPreview = {
  id: string;
  title: string;
  completed: boolean;
  listTitle?: string;
};

export type OverviewChecklistPreview = {
  id: string;
  title: string;
  remainingCount: number;
  totalCount: number;
  sampleItems: { id: string; text: string; checked: boolean }[];
};

export type OverviewNotePreview = {
  id: string;
  title?: string | null;
  excerpt: string;
  updatedAt: Date;
};

export type OverviewData = {
  week: { start: Date; end: Date };
  activities: OverviewActivityPreview[];
  todos: OverviewTodoPreview[];
  checklists: OverviewChecklistPreview[];
  notes: OverviewNotePreview[];
};

// ---------- Date helpers (timezone-safe) ----------
const TZ = "Europe/Stockholm";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function dateOnlyInTZ(d: Date, timeZone = TZ): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const yyyy = parts.find((p) => p.type === "year")?.value ?? "1970";
  const mm = parts.find((p) => p.type === "month")?.value ?? "01";
  const dd = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${yyyy}-${mm}-${dd}`;
}

function weekdayInTZ(d: Date, timeZone = TZ): number {
  // Return 0..6 where 0=Mon, ... 6=Sun
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(d);

  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  return map[wd] ?? 0;
}

function addDaysDateOnly(dateOnly: string, days: number): string {
  // use noon UTC to avoid DST edge-cases
  const base = new Date(`${dateOnly}T12:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return `${base.getUTCFullYear()}-${pad2(base.getUTCMonth() + 1)}-${pad2(
    base.getUTCDate()
  )}`;
}

function toWeekRangeDateOnly(now: Date) {
  const today = dateOnlyInTZ(now, TZ);
  const wd = weekdayInTZ(now, TZ); // 0=Mon..6=Sun
  const start = addDaysDateOnly(today, -wd);
  const end = addDaysDateOnly(start, 6);
  return { start, end };
}

function safeExcerpt(input: string, maxLen = 110) {
  const s = input.replace(/\s+/g, " ").trim();
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen).trimEnd() + "…";
}

function toValidDate(value: unknown): Date | null {
  if (
    typeof value === "string" ||
    value instanceof Date ||
    typeof value === "number"
  ) {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  return null;
}

function normalizeDateOnly(dateValue: unknown): string | null {
  if (typeof dateValue !== "string") return null;
  const dateOnly = dateValue.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ? dateOnly : null;
}

function normalizeTime(timeValue: unknown): string | null {
  if (typeof timeValue !== "string") return null;

  // Om startTime råkar vara en hel ISO-string
  if (timeValue.includes("T")) return timeValue;

  // HH:MM
  if (/^\d{2}:\d{2}$/.test(timeValue)) return `${timeValue}:00`;

  // HH:MM:SS
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeValue)) return timeValue;

  // HH:MM:SS.mmm (med valfri Z)
  if (/^\d{2}:\d{2}:\d{2}\.\d{1,3}Z?$/.test(timeValue)) {
    return timeValue.replace(/Z$/, "");
  }

  // HH:MM:SSZ
  if (/^\d{2}:\d{2}:\d{2}Z$/.test(timeValue)) {
    return timeValue.replace(/Z$/, "");
  }

  return null;
}

/**
 * Kombinerar date + startTime till ett Date-objekt.
 * - Om timeValue är en ISO-string: parse direkt
 * - Annars: normalisera HH:MM / HH:MM:SS och bygg "YYYY-MM-DDTHH:MM:SS"
 * Vi lägger INTE på "Z" här (lokal tid-känsla), men veckofiltret görs på dateOnly ändå.
 */
function combineDateAndTimeLoose(
  dateValue: unknown,
  timeValue: unknown
): Date | null {
  const dateOnly = normalizeDateOnly(dateValue);
  if (!dateOnly) return null;

  // ISO datetime i startTime (ifall du någon gång skickar in den formen)
  if (typeof timeValue === "string" && timeValue.includes("T")) {
    const d = new Date(timeValue);
    return Number.isFinite(d.getTime()) ? d : null;
  }

  const t = normalizeTime(timeValue);
  if (!t) return null;

  const d = new Date(`${dateOnly}T${t}`);
  return Number.isFinite(d.getTime()) ? d : null;
}

function compareActivities(
  a: { dateOnly: string; time: string },
  b: { dateOnly: string; time: string }
) {
  if (a.dateOnly !== b.dateOnly) return a.dateOnly.localeCompare(b.dateOnly);
  return a.time.localeCompare(b.time);
}

// ---------- Main action ----------
export async function getOverviewData(): Promise<OverviewData> {
  noStore();

  const now = new Date();
  const week = toWeekRangeDateOnly(now);

  // används bara för rubriken i UI (Date-objekt)
  const weekStartForUI = new Date(`${week.start}T00:00:00.000Z`);
  const weekEndForUI = new Date(`${week.end}T23:59:59.999Z`);

  // Hämta månad(er) baserat på week.start/week.end (dateOnly)
  const startYear = Number(week.start.slice(0, 4));
  const startMonth = Number(week.start.slice(5, 7));

  const endYear = Number(week.end.slice(0, 4));
  const endMonth = Number(week.end.slice(5, 7));

  const needsTwoMonths = startYear !== endYear || startMonth !== endMonth;

  const [activitiesRes1, activitiesRes2, todoListsRes, checklistsRes, notesRes] =
    await Promise.all([
      getActivitiesForMonth({ year: startYear, month: startMonth }),
      needsTwoMonths
        ? getActivitiesForMonth({ year: endYear, month: endMonth })
        : Promise.resolve({ success: true, data: [] as unknown[] }),
      getTodoLists(),
      getChecklists(),
      getNotes(),
    ]);

  const raw1 = unwrap(activitiesRes1 as ActionResult<unknown[]>, []);
  const raw2 = unwrap(activitiesRes2 as ActionResult<unknown[]>, []);
  const activitiesRaw = [...raw1, ...raw2];

  function startsAtFromDateAndTime(dateOnly: string, time: string): Date {
    return new Date(`${dateOnly}T${time}Z`);
  }

  // Aktiviteter: filtrera på dateOnly (timezone-säkert)
  const activities: OverviewActivityPreview[] = activitiesRaw
    .map((a) => {
      const obj = a as Record<string, unknown>;

      const allDay = Boolean(obj.allDay);
      const dateOnly = normalizeDateOnly(obj.date);

      // "har användaren valt en tid?"
      const hasTime =
        typeof obj.startTime === "string" && obj.startTime.trim() !== "";

      // sort-tid: default 12:00 om heldag eller saknar tid
      const sortTime = allDay || !hasTime ? "12:00:00" : normalizeTime(obj.startTime);

      // startsAt: alltid ett giltigt Date så vi kan sortera/formattera datum
      const startsAt =
        dateOnly && sortTime ? startsAtFromDateAndTime(dateOnly, sortTime) : null;

      if (!dateOnly || !sortTime || !startsAt) return null;

      return {
        id: String(obj.id ?? ""),
        title: String(obj.title ?? "Aktivitet"),
        startsAt,
        allDay,
        hasTime,
        __sort: {
          dateOnly,
          time: sortTime,
        },
      } as OverviewActivityPreview & {
        __sort: { dateOnly: string; time: string };
      };
    })
    .filter(
      (
        a
      ): a is OverviewActivityPreview & {
        __sort: { dateOnly: string; time: string };
      } => !!a && a.__sort.dateOnly >= week.start && a.__sort.dateOnly <= week.end
    )
    .sort((a, b) => compareActivities(a.__sort, b.__sort))
    .slice(0, 5)
    .map(({ __sort: _sort, ...rest }) => rest);

  const first = activitiesRaw[0] as Record<string, unknown> | undefined;
  console.log("activities after filter", activities.length);
  console.log("first mapped date/time", first?.date, first?.startTime);

  // 2) Todos
  const todoListsRaw = unwrap(todoListsRes as ActionResult<unknown[]>, []);

  const todos: OverviewTodoPreview[] = todoListsRaw
    .flatMap((list) => {
      const l = list as Record<string, unknown>;
      const listTitle = String(l.title ?? l.name ?? "Lista");
      const items = Array.isArray(l.todos) ? l.todos : [];

      return items.map((t) => {
        const todo = t as Record<string, unknown>;
        return {
          id: String(todo.id ?? ""),
          title: String(todo.title ?? todo.text ?? "Todo"),
          completed: Boolean(todo.done ?? todo.completed ?? false),
          listTitle,
        };
      });
    })
    .slice(0, 8);

  // 3) Checklists
  const checklistsRaw = unwrap(checklistsRes as ActionResult<unknown[]>, []);

  const checklists: OverviewChecklistPreview[] = checklistsRaw
    .slice(0, 3)
    .map((c) => {
      const obj = c as Record<string, unknown>;
      const items = Array.isArray(obj.items)
        ? obj.items
        : Array.isArray(obj.checklistItems)
        ? obj.checklistItems
        : [];

      const normalizedItems = items.map((i) => {
        const it = i as Record<string, unknown>;
        return {
          id: String(it.id ?? ""),
          text: String(it.text ?? it.title ?? "Rad"),
          checked: Boolean(it.checked ?? it.done ?? false),
        };
      });

      const totalCount = normalizedItems.length;
      const remainingCount = normalizedItems.filter((i) => !i.checked).length;

      return {
        id: String(obj.id ?? ""),
        title: String(obj.title ?? obj.name ?? "Checklista"),
        remainingCount,
        totalCount,
        sampleItems: normalizedItems.slice(0, 6),
      };
    });

  // 4) Notes
  const notesRaw = unwrap(notesRes as ActionResult<unknown[]>, []);

  const notes: OverviewNotePreview[] = notesRaw
    .map((n) => {
      const obj = n as Record<string, unknown>;
      const body = String(obj.body ?? obj.content ?? "");
      const updatedAt =
        toValidDate(obj.updatedAt) ?? toValidDate(obj.createdAt) ?? new Date();

      return {
        id: String(obj.id ?? ""),
        title: obj.title ? String(obj.title) : null,
        excerpt: safeExcerpt(body),
        updatedAt,
      };
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3);

  return {
    week: { start: weekStartForUI, end: weekEndForUI },
    activities,
    todos,
    checklists,
    notes,
  };
}
