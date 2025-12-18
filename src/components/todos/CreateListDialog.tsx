// app/todos/CreateListDialog.tsx
"use client";

import * as React from "react";
import { useTransition } from "react";
import { createTodoList } from "@/app/todos/actions";
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

export default function CreateListDialog() {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createTodoList({ title });

      if (!res.success) {
        setError(res.error);
        return;
      }

      setTitle("");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="inline-flex items-center gap-2">
          <Plus className="size-4" />
          Ny lista
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ny lista</DialogTitle>
          <DialogDescription>
            Skapa en ny todo-lista, till exempel &quot;Elin&quot;,
            &quot;Simon&quot; eller &quot;Packlista Norge&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titel</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ange listans namn..."
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
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
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Lägger till..." : "Spara lista"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
