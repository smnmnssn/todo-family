"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const TODO_REVALIDATE_PATH = "/todos";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Auth helper (DB-säker)
 */
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

/**
 * Zod-scheman
 */
const todoListCreateSchema = z.object({
  title: z.string().min(1, "Listan måste ha en titel").max(100),
});

const todoListUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Listan måste ha en titel").max(100),
});

const todoCreateSchema = z.object({
  title: z.string().min(1, "Todo måste ha en titel").max(200),
  listId: z.string().min(1, "Todo måste tillhöra en lista"),
});

const todoUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Todo måste ha en titel").max(200),
});

const todoToggleSchema = z.object({
  id: z.string().min(1),
  done: z.boolean(),
});

const idSchema = z.object({
  id: z.string().min(1),
});

/**
 * READ
 * Hämta alla listor (för inloggad användare) med deras todos
 */
export async function getTodoLists(): Promise<
  ActionResult<
    {
      id: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
      todos: {
        id: string;
        title: string;
        done: boolean;
        createdAt: Date;
        updatedAt: Date;
      }[];
    }[]
  >
> {
  try {
    const ownerId = await requireUserId();

    const lists = await prisma.todoList.findMany({
      where: { ownerId },
      orderBy: { createdAt: "asc" },
      include: {
        todos: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return { success: true, data: lists };
  } catch (error) {
    console.error("getTodoLists error", error);
    return { success: false, error: "Kunde inte hämta listor." };
  }
}

/**
 * CREATE
 * Skapa ny lista (kopplas till inloggad användare)
 */
export async function createTodoList(
  values: z.infer<typeof todoListCreateSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = todoListCreateSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltiga data för lista.",
    };
  }

  try {
    const ownerId = await requireUserId();

    const list = await prisma.todoList.create({
      data: {
        title: parsed.data.title.trim(),
        ownerId,
      },
    });

    revalidatePath(TODO_REVALIDATE_PATH);
    return { success: true, data: { id: list.id } };
  } catch (error) {
    console.error("createTodoList error", error);
    return { success: false, error: "Kunde inte skapa lista." };
  }
}

/**
 * UPDATE
 * Byt titel på lista (endast om listan tillhör användaren)
 */
export async function updateTodoList(
  values: z.infer<typeof todoListUpdateSchema>
): Promise<ActionResult<null>> {
  const parsed = todoListUpdateSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltiga data för lista.",
    };
  }

  try {
    const ownerId = await requireUserId();

    const res = await prisma.todoList.updateMany({
      where: { id: parsed.data.id, ownerId },
      data: { title: parsed.data.title.trim() },
    });

    if (res.count === 0) {
      return { success: false, error: "Listan hittades inte." };
    }

    revalidatePath(TODO_REVALIDATE_PATH);
    return { success: true, data: null };
  } catch (error) {
    console.error("updateTodoList error", error);
    return { success: false, error: "Kunde inte uppdatera lista." };
  }
}

/**
 * DELETE
 * Ta bort lista + alla dess todos (endast om listan tillhör användaren)
 */
export async function deleteTodoList(
  values: z.infer<typeof idSchema>
): Promise<ActionResult<null>> {
  const parsed = idSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Ogiltigt lista-id." };
  }

  try {
    const ownerId = await requireUserId();

    const list = await prisma.todoList.findFirst({
      where: { id: parsed.data.id, ownerId },
      select: { id: true },
    });

    if (!list) {
      return { success: false, error: "Listan hittades inte." };
    }

    await prisma.todoList.delete({
      where: { id: list.id },
    });

    revalidatePath(TODO_REVALIDATE_PATH);
    return { success: true, data: null };
  } catch (error) {
    console.error("deleteTodoList error", error);
    return { success: false, error: "Kunde inte ta bort lista." };
  }
}

/**
 * CREATE
 * Skapa ny todo i en lista (endast om listan tillhör användaren)
 */
export async function createTodo(
  values: z.infer<typeof todoCreateSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = todoCreateSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltiga data för todo.",
    };
  }

  try {
    const ownerId = await requireUserId();

    const list = await prisma.todoList.findFirst({
      where: { id: parsed.data.listId, ownerId },
      select: { id: true },
    });

    if (!list) {
      return { success: false, error: "Listan hittades inte." };
    }

    const todo = await prisma.todo.create({
      data: {
        title: parsed.data.title.trim(),
        listId: list.id,
      },
    });

    revalidatePath(TODO_REVALIDATE_PATH);
    return { success: true, data: { id: todo.id } };
  } catch (error) {
    console.error("createTodo error", error);
    return { success: false, error: "Kunde inte skapa todo." };
  }
}

/**
 * UPDATE
 * Uppdatera titel på todo (endast om todo ligger i en lista som usern äger)
 */
export async function updateTodo(
  values: z.infer<typeof todoUpdateSchema>
): Promise<ActionResult<null>> {
  const parsed = todoUpdateSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltiga data för todo.",
    };
  }

  try {
    const ownerId = await requireUserId();

    const res = await prisma.todo.updateMany({
      where: {
        id: parsed.data.id,
        list: { ownerId },
      },
      data: { title: parsed.data.title.trim() },
    });

    if (res.count === 0) {
      return { success: false, error: "Todo hittades inte." };
    }

    revalidatePath(TODO_REVALIDATE_PATH);
    return { success: true, data: null };
  } catch (error) {
    console.error("updateTodo error", error);
    return { success: false, error: "Kunde inte uppdatera todo." };
  }
}

/**
 * TOGGLE
 * Sätt done true/false (endast om todo ligger i en lista som usern äger)
 */
export async function toggleTodoDone(
  values: z.infer<typeof todoToggleSchema>
): Promise<ActionResult<null>> {
  const parsed = todoToggleSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Ogiltiga data för todo." };
  }

  try {
    const ownerId = await requireUserId();

    const res = await prisma.todo.updateMany({
      where: {
        id: parsed.data.id,
        list: { ownerId },
      },
      data: { done: parsed.data.done },
    });

    if (res.count === 0) {
      return { success: false, error: "Todo hittades inte." };
    }

    revalidatePath(TODO_REVALIDATE_PATH);
    return { success: true, data: null };
  } catch (error) {
    console.error("toggleTodoDone error", error);
    return { success: false, error: "Kunde inte uppdatera todo." };
  }
}

/**
 * DELETE
 * Ta bort en todo (endast om todo ligger i en lista som usern äger)
 */
export async function deleteTodo(
  values: z.infer<typeof idSchema>
): Promise<ActionResult<null>> {
  const parsed = idSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Ogiltigt todo-id." };
  }

  try {
    const ownerId = await requireUserId();

    const res = await prisma.todo.deleteMany({
      where: {
        id: parsed.data.id,
        list: { ownerId },
      },
    });

    if (res.count === 0) {
      return { success: false, error: "Todo hittades inte." };
    }

    revalidatePath(TODO_REVALIDATE_PATH);
    return { success: true, data: null };
  } catch (error) {
    console.error("deleteTodo error", error);
    return { success: false, error: "Kunde inte ta bort todo." };
  }
}
