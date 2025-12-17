"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createNote } from "../../app/notes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NewNoteDialog() {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTitle("");
      setContent("");
      setError(null);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Anteckningen måste ha en titel.");
      return;
    }

    if (!content.trim()) {
      setError("Anteckningen får inte vara tom.");
      return;
    }

    setLoading(true);

    const result = await createNote({
      title: title.trim(),
      content: content.trim(),
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
    setTitle("");
    setContent("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 px-3 text-xs">
          Ny anteckning
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl border border-white/70 bg-white/80 px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#3b4a5c]">
            Ny anteckning
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            Skriv ned något du vill komma ihåg eller spara.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3b4a5c]">
              Titel
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex. Idéer till helgen"
              autoFocus
              className="bg-white/80"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3b4a5c]">
              Innehåll
            </label>
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              placeholder="Skriv din anteckning här..."
              className="bg-white/80"
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
