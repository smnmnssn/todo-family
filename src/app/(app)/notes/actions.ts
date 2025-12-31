"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

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

// --- Auth helper (DB-säker) ---

async function requireUserId(): Promise<number> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user.id;
}

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

// --- READ: hämta alla anteckningar (för inloggad användare) ---

export async function getNotes(): Promise<ActionResult<NoteDTO[]>> {
  try {
    const ownerId = await requireUserId();

    const notes = await prisma.note.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
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
  values: z.infer<typeof createNoteSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = createNoteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltiga data för anteckning.",
    };
  }

  const { title, content } = parsed.data;

  try {
    const ownerId = await requireUserId();

    const created = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        ownerId,
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
  values: z.infer<typeof updateNoteSchema>
): Promise<ActionResult<null>> {
  const parsed = updateNoteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltiga data för anteckning.",
    };
  }

  const { id, title, content } = parsed.data;

  try {
    const ownerId = await requireUserId();

    const res = await prisma.note.updateMany({
      where: { id, ownerId },
      data: {
        title: title.trim(),
        content: content.trim(),
      },
    });

    if (res.count === 0) {
      return { success: false, error: "Anteckningen hittades inte." };
    }

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
  values: z.infer<typeof deleteNoteSchema>
): Promise<ActionResult<null>> {
  const parsed = deleteNoteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltigt id.",
    };
  }

  try {
    const ownerId = await requireUserId();

    const res = await prisma.note.deleteMany({
      where: { id: parsed.data.id, ownerId },
    });

    if (res.count === 0) {
      return { success: false, error: "Anteckningen hittades inte." };
    }

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
