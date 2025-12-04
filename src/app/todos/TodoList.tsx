// app/todos/TodoList.tsx
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
import { MoreVertical, Edit3, Trash2 } from "lucide-react";
import {
  toggleTodoDone,
  deleteTodo,
  deleteTodoList,
  updateTodoList,
} from "./actions";
import CreateTodoDialog from "./CreateTodoDialog";

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
  const [editOpen, setEditOpen] = React.useState(false);
  const [title, setTitle] = React.useState(list.title);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleUpdateTitle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await updateTodoList({ id: list.id, title });
    if (res.success) {
      setEditOpen(false);
    }
  }

  async function handleDeleteList() {
    setIsDeleting(true);
    await deleteTodoList({ id: list.id });
    setIsDeleting(false);
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            {list.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {list.todos.length} {list.todos.length === 1 ? "uppgift" : "uppgifter"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <CreateTodoDialog listId={list.id} />

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DialogTrigger asChild>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Edit3 className="size-3.5" />
                    Byt namn
                  </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                  onClick={handleDeleteList}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-3.5" />
                  Ta bort lista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Byt namn på lista</DialogTitle>
                <DialogDescription>
                  Uppdatera titeln för listan. Detta påverkar inte dina befintliga todos.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateTitle} className="space-y-4">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Lista..."
                  autoFocus
                />
                <DialogFooter className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
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

      <CardContent className="flex-1 pt-4">
  {list.todos.length === 0 ? (
    <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
      <div className="rounded-full bg-muted p-2">
        <svg className="size-5 text-muted-foreground" 
             xmlns="http://www.w3.org/2000/svg" 
             fill="none" 
             viewBox="0 0 24 24" 
             stroke="currentColor" 
             strokeWidth="2">
          <path d="M9 12h6M12 9v6" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>

      <p className="text-xs text-muted-foreground">
        Inga uppgifter här ännu.
      </p>

      <CreateTodoDialog listId={list.id} />
    </div>
  ) : (
          <ul className="space-y-2 text-sm">
            {list.todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60"
              >
                <label className="flex flex-1 items-center gap-3">
                  <Checkbox
                    checked={todo.done}
                    onCheckedChange={async (checked) =>
                      await toggleTodoDone({ id: todo.id, done: !!checked })
                    }
                  />
                  <span
                    className={
                      todo.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }
                  >
                    {todo.title}
                  </span>
                </label>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    await deleteTodo({ id: todo.id });
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
