"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createChecklist } from "../checklists/actions";
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

export function NewChecklistDialog() {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTitle("");
      setError(null);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Listan måste ha en titel.");
      return;
    }

    setLoading(true);

    const result = await createChecklist({ title: title.trim() });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
    setTitle("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          Ny lista
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ny checklista</DialogTitle>
          <DialogDescription>
            Skapa en ny lista, till exempel en shoppinglista eller packlista.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Titel
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex. Shoppinglista"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">
              {error}
            </p>
          )}

          <DialogFooter className="mt-2 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Skapar..." : "Spara"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
