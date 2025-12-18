"use server";

import { unstable_noStore as noStore } from "next/cache";
import { getActivitiesForMonth } from "@/app/calendar/actions";
import { getTodoLists } from "@/app/todos/actions";
import { getChecklists } from "@/app/checklists/actions";
import { getNotes } from "@/app/notes/actions";

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
  startsAt: Date;
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

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun, 1=Mon
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfWeekSunday(d: Date) {
  const start = startOfWeekMonday(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function safeExcerpt(input: string, maxLen = 110) {
  const s = input.replace(/\s+/g, " ").trim();
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen).trimEnd() + "…";
}

function toValidDate(value: unknown): Date | null {
  if (typeof value === "string" || value instanceof Date || typeof value === "number") {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  return null;
}

function combineDateAndTime(dateStr: unknown, timeStr: unknown): Date | null {
  if (typeof dateStr !== "string" || typeof timeStr !== "string") return null;

  const d = new Date(`${dateStr}T${timeStr}:00`);
  return Number.isFinite(d.getTime()) ? d : null;
}


export async function getOverviewData(): Promise<OverviewData> {
  noStore();

  const now = new Date();
  const weekStart = startOfWeekMonday(now);
  const weekEnd = endOfWeekSunday(now);

  const year = now.getFullYear();
  const month = now.getMonth() + 1; // ofta 1-12 i actions

  const [activitiesRes, todoListsRes, checklistsRes, notesRes] = await Promise.all([
    getActivitiesForMonth({ year, month }),
    getTodoLists(),
    getChecklists(),
    getNotes(),
  ]);

  
  // 1) Activities: du får månad -> vi filtrerar till denna vecka
  const activitiesRaw = unwrap(activitiesRes as ActionResult<unknown[]>, []);
  console.log("activity sample", activitiesRaw?.[0]);


  const activities: OverviewActivityPreview[] = activitiesRaw
  .map((a) => {
    const obj = a as Record<string, unknown>;

    const startsAt =
      combineDateAndTime(obj.date, obj.startTime) ??
      toValidDate(obj.startsAt) ??
      toValidDate(obj.start);

    return {
      id: String(obj.id ?? ""),
      title: String(obj.title ?? "Aktivitet"),
      startsAt: startsAt ?? new Date(0),
    };
  })
  .filter(
    (a) =>
      a.startsAt.getTime() >= weekStart.getTime() &&
      a.startsAt.getTime() <= weekEnd.getTime()
  )
  .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
  .slice(0, 5);


  // 2) Todos: du verkar ha todo-lists med todos inuti
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

  // 3) Checklists: antar items i checklist
  const checklistsRaw = unwrap(checklistsRes as ActionResult<unknown[]>, []);

  const checklists: OverviewChecklistPreview[] = checklistsRaw.slice(0, 3).map((c) => {
    const obj = c as Record<string, unknown>;
    const items = Array.isArray(obj.items) ? obj.items : Array.isArray(obj.checklistItems) ? obj.checklistItems : [];

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
      const updatedAt = toValidDate(obj.updatedAt) ?? toValidDate(obj.createdAt) ?? new Date();

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
    week: { start: weekStart, end: weekEnd },
    activities,
    todos,
    checklists,
    notes,
  };
}
