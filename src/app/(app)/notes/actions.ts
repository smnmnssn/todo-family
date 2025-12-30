"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const NOTES_REVALIDATE_PATH = "/notes";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// --- Scheman ---

const createNoteSchema = z.object({
  title: z.string().min(1, "Anteckningen måste ha en titel").max(200),
  content: z
    .string()
    .min(1, "Anteckningen får inte vara tom.")
    .max(5000, "Anteckningen är för lång."),
});

const updateNoteSchema = createNoteSchema.extend({
  id: z.string().min(1, "Ogiltigt id."),
});

const deleteNoteSchema = z.object({
  id: z.string().min(1, "Ogiltigt id."),
});

// --- DTO-typer ---

export type NoteDTO = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

// --- Helpers ---

function mapNoteToDTO(note: {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}): NoteDTO {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

// --- READ: hämta alla anteckningar ---

export async function getNotes(): Promise<ActionResult<NoteDTO[]>> {
  try {
    const notes = await prisma.note.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return {
      success: true,
      data: notes.map(mapNoteToDTO),
    };
  } catch (error) {
    console.error("getNotes error", error);
    return {
      success: false,
      error: "Kunde inte hämta anteckningar.",
    };
  }
}

// --- CREATE ---

export async function createNote(
  values: z.infer<typeof createNoteSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createNoteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ?? "Ogiltiga data för anteckning.",
    };
  }

  const { title, content } = parsed.data;

  try {
    const created = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content.trim(),
      },
    });

    revalidatePath(NOTES_REVALIDATE_PATH);

    return {
      success: true,
      data: { id: created.id },
    };
  } catch (error) {
    console.error("createNote error", error);
    return {
      success: false,
      error: "Kunde inte skapa anteckning.",
    };
  }
}

// --- UPDATE ---

export async function updateNote(
  values: z.infer<typeof updateNoteSchema>,
): Promise<ActionResult<null>> {
  const parsed = updateNoteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ?? "Ogiltiga data för anteckning.",
    };
  }

  const { id, title, content } = parsed.data;

  try {
    await prisma.note.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
      },
    });

    revalidatePath(NOTES_REVALIDATE_PATH);

    return { success: true, data: null };
  } catch (error) {
    console.error("updateNote error", error);
    return {
      success: false,
      error: "Kunde inte uppdatera anteckningen.",
    };
  }
}

// --- DELETE ---

export async function deleteNote(
  values: z.infer<typeof deleteNoteSchema>,
): Promise<ActionResult<null>> {
  const parsed = deleteNoteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltigt id.",
    };
  }

  try {
    await prisma.note.delete({
      where: { id: parsed.data.id },
    });

    revalidatePath(NOTES_REVALIDATE_PATH);

    return { success: true, data: null };
  } catch (error) {
    console.error("deleteNote error", error);
    return {
      success: false,
      error: "Kunde inte ta bort anteckningen.",
    };
  }
}
