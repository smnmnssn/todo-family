"use server";

import { prisma } from "@/lib/prisma";
import { Activity } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CALENDAR_REVALIDATE_PATH = "/calendar"; // ändra till din riktiga route

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// --- Hjälpare ---

// "2025-11-02" -> Date (UTC, datum-del)
function parseDateOnly(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  return new Date(Date.UTC(year, month - 1, day));
}

const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Klockslag måste vara på formatet HH:MM")
  .optional();

// --- Scheman ---

const activityBaseSchema = z.object({
  title: z.string().min(1, "Aktiviteten måste ha en titel").max(200),
  description: z.string().max(1000).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum måste vara på formatet ÅÅÅÅ-MM-DD"),
  startTime: timeSchema,
  endTime: timeSchema,
  allDay: z.boolean().optional(),
});

const createActivitySchema = activityBaseSchema;

const updateActivitySchema = activityBaseSchema.extend({
  id: z.string().min(1),
});

const deleteSchema = z.object({
  id: z.string().min(1),
});

const monthQuerySchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12), // 1–12
});

// --- Typer för returdata ---

export type ActivityDTO = {
  id: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
};

// Mappar Prisma-objekt till DTO med date som YYYY-MM-DD-string
function mapActivityToDTO(a: Activity): ActivityDTO {
  const date = new Date(a.date);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");

  return {
    id: a.id,
    title: a.title,
    description: a.description,
    date: `${yyyy}-${mm}-${dd}`,
    startTime: a.startTime,
    endTime: a.endTime,
    allDay: a.allDay,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

// --- READ: hämta aktiviteter för en månad ---

export async function getActivitiesForMonth(
  params: z.infer<typeof monthQuerySchema>
): Promise<ActionResult<ActivityDTO[]>> {
  const parsed = monthQuerySchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltiga parametrar för månad.",
    };
  }

  const { year, month } = parsed.data;

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1)); // exklusiv

  try {
    const activities = await prisma.activity.findMany({
      where: {
        date: {
          gte: start,
          lt: end,
        },
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
        { title: "asc" },
      ],
    });

    return {
      success: true,
      data: activities.map(mapActivityToDTO),
    };
  } catch (error) {
    console.error("getActivitiesForMonth error", error);
    return {
      success: false,
      error: "Kunde inte hämta aktiviteter för månaden.",
    };
  }
}

// (Valfritt men bra för edit-modal)
export async function getActivityById(
  id: string
): Promise<ActionResult<ActivityDTO>> {
  if (!id) {
    return { success: false, error: "Ogiltigt id." };
  }

  try {
    const activity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      return { success: false, error: "Aktiviteten hittades inte." };
    }

    return { success: true, data: mapActivityToDTO(activity) };
  } catch (error) {
    console.error("getActivityById error", error);
    return { success: false, error: "Kunde inte hämta aktiviteten." };
  }
}

// --- CREATE ---

export async function createActivity(
  values: z.infer<typeof createActivitySchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = createActivitySchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltiga data för aktivitet.",
    };
  }

  const { title, description, date, startTime, endTime, allDay } = parsed.data;

  try {
    const created = await prisma.activity.create({
      data: {
        title,
        description,
        date: parseDateOnly(date),
        startTime: allDay ? null : startTime ?? null,
        endTime: allDay ? null : endTime ?? null,
        allDay: allDay ?? false,
      },
    });

    revalidatePath(CALENDAR_REVALIDATE_PATH);

    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error("createActivity error", error);
    return {
      success: false,
      error: "Kunde inte skapa aktivitet.",
    };
  }
}

// --- UPDATE ---

export async function updateActivity(
  values: z.infer<typeof updateActivitySchema>
): Promise<ActionResult<null>> {
  const parsed = updateActivitySchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltiga data för aktivitet.",
    };
  }

  const { id, title, description, date, startTime, endTime, allDay } =
    parsed.data;

  try {
    await prisma.activity.update({
      where: { id },
      data: {
        title,
        description,
        date: parseDateOnly(date),
        startTime: allDay ? null : startTime ?? null,
        endTime: allDay ? null : endTime ?? null,
        allDay: allDay ?? false,
      },
    });

    revalidatePath(CALENDAR_REVALIDATE_PATH);

    return { success: true, data: null };
  } catch (error) {
    console.error("updateActivity error", error);
    return {
      success: false,
      error: "Kunde inte uppdatera aktiviteten.",
    };
  }
}

// --- DELETE ---

export async function deleteActivity(
  values: z.infer<typeof deleteSchema>
): Promise<ActionResult<null>> {
  const parsed = deleteSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Ogiltigt id för aktivitet." };
  }

  try {
    await prisma.activity.delete({
      where: { id: parsed.data.id },
    });

    revalidatePath(CALENDAR_REVALIDATE_PATH);

    return { success: true, data: null };
  } catch (error) {
    console.error("deleteActivity error", error);
    return {
      success: false,
      error: "Kunde inte ta bort aktiviteten.",
    };
  }
}
