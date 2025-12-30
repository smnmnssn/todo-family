"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CHECKLIST_REVALIDATE_PATH = "/notes";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// --- Scheman ---

const createChecklistSchema = z.object({
  title: z.string().min(1, "Listan måste ha en titel").max(200),
});

const addItemSchema = z.object({
  checklistId: z.string().min(1, "Ogiltigt checklist-id."),
  text: z.string().min(1, "Punkten måste ha en text.").max(300),
});

const toggleItemSchema = z.object({
  id: z.string().min(1, "Ogiltigt item-id."),
});

const deleteChecklistSchema = z.object({
  id: z.string().min(1, "Ogiltigt checklist-id."),
});

const deleteItemSchema = z.object({
  id: z.string().min(1, "Ogiltigt item-id."),
});

// --- DTO-typer ---

export type ChecklistItemDTO = {
  id: string;
  text: string;
  done: boolean;
  checklistId: string;
  createdAt: string;
  updatedAt: string;
};

export type ChecklistDTO = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  items: ChecklistItemDTO[];
};

// --- Helpers ---

function mapChecklistItemToDTO(item: {
  id: string;
  text: string;
  done: boolean;
  checklistId: string;
  createdAt: Date;
  updatedAt: Date;
}): ChecklistItemDTO {
  return {
    id: item.id,
    text: item.text,
    done: item.done,
    checklistId: item.checklistId,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function mapChecklistToDTO(checklist: {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    text: string;
    done: boolean;
    checklistId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}): ChecklistDTO {
  return {
    id: checklist.id,
    title: checklist.title,
    createdAt: checklist.createdAt.toISOString(),
    updatedAt: checklist.updatedAt.toISOString(),
    items: checklist.items.map(mapChecklistItemToDTO),
  };
}

// --- READ: hämta alla checklistor ---

export async function getChecklists(): Promise<ActionResult<ChecklistDTO[]>> {
  try {
    const lists = await prisma.checklist.findMany({
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: lists.map(mapChecklistToDTO),
    };
  } catch (error) {
    console.error("getChecklists error", error);
    return {
      success: false,
      error: "Kunde inte hämta checklistor.",
    };
  }
}

// --- CREATE: ny checklista ---

export async function createChecklist(
  values: z.infer<typeof createChecklistSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createChecklistSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ?? "Ogiltiga data för checklista.",
    };
  }

  try {
    const created = await prisma.checklist.create({
      data: {
        title: parsed.data.title.trim(),
      },
    });

    revalidatePath(CHECKLIST_REVALIDATE_PATH);

    return {
      success: true,
      data: { id: created.id },
    };
  } catch (error) {
    console.error("createChecklist error", error);
    return {
      success: false,
      error: "Kunde inte skapa checklista.",
    };
  }
}

// --- CREATE: nytt item i en lista ---

export async function addChecklistItem(
  values: z.infer<typeof addItemSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = addItemSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ?? "Ogiltiga data för checklist-punkt.",
    };
  }

  const { checklistId, text } = parsed.data;

  try {
    const created = await prisma.checklistItem.create({
      data: {
        checklistId,
        text: text.trim(),
      },
    });

    revalidatePath(CHECKLIST_REVALIDATE_PATH);

    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error("addChecklistItem error", error);
    return {
      success: false,
      error: "Kunde inte lägga till punkt i listan.",
    };
  }
}

// --- UPDATE: toggla done på ett item ---

export async function toggleChecklistItem(
  values: z.infer<typeof toggleItemSchema>,
): Promise<ActionResult<null>> {
  const parsed = toggleItemSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltigt item-id.",
    };
  }

  const { id } = parsed.data;

  try {
    const existing = await prisma.checklistItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Punkten hittades inte.",
      };
    }

    await prisma.checklistItem.update({
      where: { id },
      data: {
        done: !existing.done,
      },
    });

    revalidatePath(CHECKLIST_REVALIDATE_PATH);

    return { success: true, data: null };
  } catch (error) {
    console.error("toggleChecklistItem error", error);
    return {
      success: false,
      error: "Kunde inte uppdatera punktens status.",
    };
  }
}

// --- DELETE: ta bort en hel checklista ---

export async function deleteChecklist(
  values: z.infer<typeof deleteChecklistSchema>,
): Promise<ActionResult<null>> {
  const parsed = deleteChecklistSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltigt checklist-id.",
    };
  }

  try {
    await prisma.checklist.delete({
      where: { id: parsed.data.id },
    });

    revalidatePath(CHECKLIST_REVALIDATE_PATH);

    return { success: true, data: null };
  } catch (error) {
    console.error("deleteChecklist error", error);
    return {
      success: false,
      error: "Kunde inte ta bort checklistan.",
    };
  }
}

// --- DELETE: ta bort en punkt ---

export async function deleteChecklistItem(
  values: z.infer<typeof deleteItemSchema>,
): Promise<ActionResult<null>> {
  const parsed = deleteItemSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltigt item-id.",
    };
  }

  try {
    await prisma.checklistItem.delete({
      where: { id: parsed.data.id },
    });

    revalidatePath(CHECKLIST_REVALIDATE_PATH);

    return { success: true, data: null };
  } catch (error) {
    console.error("deleteChecklistItem error", error);
    return {
      success: false,
      error: "Kunde inte ta bort punkten.",
    };
  }
}
