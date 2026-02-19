// components/todos/TodoList.tsx
"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoreVertical, Edit3, Trash2, Plus } from "lucide-react";
import {
  toggleTodoDone,
  deleteTodo,
  deleteTodoList,
  updateTodoList,
  createTodo,
} from "../../app/(app)/todos/actions";

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type TodoListWithTodos = {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  todos: Todo[];
};

interface TodoListProps {
  list: TodoListWithTodos;
}

export default function TodoList({ list }: TodoListProps) {
  const [todos, setTodos] = React.useState<Todo[]>(list.todos);

  const [editOpen, setEditOpen] = React.useState(false);
  const [title, setTitle] = React.useState(list.title);

  // ✅ inline add
  const [newTodoTitle, setNewTodoTitle] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [, startTransition] = React.useTransition();

  React.useEffect(() => {
    setTodos(list.todos);
  }, [list.todos]);

  function handleToggleTodo(id: string, nextDone: boolean) {
    setError(null);
    const prevTodos = todos;

    setTodos((current) =>
      current.map((t) => (t.id === id ? { ...t, done: nextDone } : t)),
    );

    startTransition(async () => {
      const res = await toggleTodoDone({ id, done: nextDone });
      if (!res.success) {
        setTodos(prevTodos);
        setError(res.error ?? "Kunde inte uppdatera uppgift.");
      }
    });
  }

  function handleDeleteTodoOptimistic(id: string) {
    setError(null);
    const prevTodos = todos;

    setTodos((current) => current.filter((t) => t.id !== id));

    startTransition(async () => {
      const res = await deleteTodo({ id });
      if (!res.success) {
        setTodos(prevTodos);
        setError(res.error ?? "Kunde inte ta bort uppgift.");
      }
    });
  }

  async function handleUpdateTitle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const res = await updateTodoList({ id: list.id, title });
    if (res.success) {
      setEditOpen(false);
      return;
    }

    setError(res.error ?? "Kunde inte uppdatera listans namn.");
  }

  async function handleDeleteList() {
    setError(null);

    startTransition(async () => {
      const res = await deleteTodoList({ id: list.id });
      if (!res?.success) {
        setError(res?.error ?? "Kunde inte ta bort lista.");
      }
    });
  }

  async function handleAddTodoInline(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = newTodoTitle.trim();
    if (!trimmed) {
      setError("Uppgiften måste ha en titel.");
      return;
    }

    // ✅ optimistic add
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimisticTodo: Todo = {
      id: tempId,
      title: trimmed,
      done: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTodos((current) => [optimisticTodo, ...current]);
    setNewTodoTitle("");

    startTransition(async () => {
      const res = await createTodo({ listId: list.id, title: trimmed });

      if (!res.success) {
        setTodos((current) => current.filter((t) => t.id !== tempId));
        setError(res.error ?? "Kunde inte skapa uppgift.");
        return;
      }

        // Success: keep optimistic item.


    });
  }

  return (
    <Card className="glass-surface flex h-full flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-white/25 bg-white/5">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-slate-900">
            {list.title}
          </CardTitle>
          <p className="text-xs text-slate-700/80">
            {todos.length} {todos.length === 1 ? "uppgift" : "uppgifter"}
          </p>
        </div>

        <div className="flex items-center gap-1">
         

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full border border-white/30 bg-white/10 text-slate-800 shadow-sm backdrop-blur-md hover:bg-white/25"
                  aria-label="Alternativ för lista"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="rounded-2xl border border-white/40 bg-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md"
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Edit3 className="size-3.5" />
                    Byt namn
                  </DropdownMenuItem>
                </DialogTrigger>

                <DropdownMenuItem
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                  onClick={handleDeleteList}
                >
                  <Trash2 className="size-3.5" aria-label="Ta bort lista" />
                  Ta bort lista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-md rounded-3xl border border-white/60 bg-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900">
                  Byt namn på lista
                </DialogTitle>
                <DialogDescription className="text-slate-700/80">
                  Uppdatera titeln för listan. Detta påverkar inte dina
                  befintliga todos.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleUpdateTitle} className="space-y-4">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Lista..."
                  autoFocus
                  className="bg-white/70"
                />

                <DialogFooter className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/50 bg-white/40 hover:bg-white/55"
                    onClick={() => {
                      setTitle(list.title);
                      setEditOpen(false);
                    }}
                  >
                    Avbryt
                  </Button>
                  <Button type="submit">Spara</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pt-4">
        {todos.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="rounded-full border border-white/40 bg-white/20 p-2 shadow-sm backdrop-blur-md">
              <svg
                className="size-5 text-slate-700/80"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12h6M12 9v6" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>

            <p className="text-xs text-slate-700/80">Inga uppgifter här ännu.</p>
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between gap-2 rounded-2xl border border-white/40 bg-white/15 px-2.5 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.10)] backdrop-blur-md transition hover:bg-white/25"
              >
                <label className="flex flex-1 items-center gap-3">
                  <Checkbox
                    aria-label="Markera uppgift som klar"
                    checked={todo.done}
                    onCheckedChange={(checked) => {
                      handleToggleTodo(todo.id, !!checked);
                    }}
                  />
                  <span
                    className={
                      todo.done
                        ? "text-slate-600/80 line-through"
                        : "text-slate-900"
                    }
                  >
                    {todo.title}
                  </span>
                </label>

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Ta bort uppgift"
                  className="h-9 w-9 rounded-full border border-white/30 bg-white/10 text-slate-700/80 shadow-sm backdrop-blur-md hover:bg-white/25 hover:text-destructive"
                  onClick={() => handleDeleteTodoOptimistic(todo.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {/* ✅ Inline add form (the only way to add now) */}
        <form onSubmit={handleAddTodoInline} className="mt-4 flex gap-2">
          <Input
            ref={inputRef}
            value={newTodoTitle}
            aria-label="Skapa ny uppgift"
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Lägg till todo..."
            className="h-9 rounded-2xl bg-white/70 text-xs"
          />
          <Button type="submit" size="sm" className="h-9 rounded-2xl px-3 text-xs">
            Lägg till
          </Button>
        </form>

        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
