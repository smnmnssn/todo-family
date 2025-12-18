"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createChecklist } from "../../app/checklists/actions";
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

  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTitle("");
      setError(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Listan måste ha en titel.");
      return;
    }

    startTransition(async () => {
      const result = await createChecklist({ title: title.trim() });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setOpen(false);
      setTitle("");
      // Behåll om du vill tvinga refresh direkt:
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 px-3 text-xs">
          Ny lista
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl border border-white/70 bg-white/80 px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#3b4a5c]">
            Ny checklista
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            Skapa en ny lista, till exempel en shoppinglista eller packlista.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3b4a5c]">Titel</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex. Shoppinglista"
              autoFocus
              className="bg-white/80"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter className="mt-2 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Skapar..." : "Spara"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
