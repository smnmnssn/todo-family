// app/todos/CreateTodoDialog.tsx
"use client";

import * as React from "react";
import { createTodo } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreateTodoDialogProps {
  listId: string;
}

export default function CreateTodoDialog({ listId }: CreateTodoDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await createTodo({ title, listId });

    setLoading(false);

    if (!res.success) {
      setError(res.error);
      return;
    }

    setTitle("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
        >
          <Plus className="mr-1 size-3.5" />
          Ny uppgift
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ny uppgift</DialogTitle>
          <DialogDescription>
            Lägg till en ny todo i den här listan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Titel
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vad behöver göras?"
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setTitle("");
                setError(null);
              }}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Lägger till..." : "Spara uppgift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
