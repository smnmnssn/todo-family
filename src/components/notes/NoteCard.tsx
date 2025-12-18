"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { NoteDTO } from "../../app/notes/actions";
import { updateNote, deleteNote } from "../../app/notes/actions";
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

interface NoteCardProps {
  note: NoteDTO;
}

export function NoteCard({ note }: NoteCardProps) {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(note.title);
  const [content, setContent] = React.useState(note.content);
  const [error, setError] = React.useState<string | null>(null);

  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function resetForm(): void {
    setTitle(note.title);
    setContent(note.content);
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
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

    startSave(async () => {
      const result = await updateNote({
        id: note.id,
        title: title.trim(),
        content: content.trim(),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  function handleDelete(): void {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort den här anteckningen?",
    );
    if (!confirmed) return;

    setError(null);

    startDelete(async () => {
      const result = await deleteNote({ id: note.id });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <article className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm shadow-[0_12px_30px_rgba(15,23,42,0.16)] backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#3b4a5c]">{note.title}</h3>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-7 px-2 text-[11px]"
          >
            {isDeleting ? "Tar bort..." : "Ta bort"}
          </Button>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" className="h-7 px-3 text-[11px]">
                Redigera
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-3xl border border-white/70 bg-white/80 px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-[#3b4a5c]">
                  Redigera anteckning
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600">
                  Uppdatera titel eller innehåll för anteckningen.
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
                    rows={5}
                    className="bg-white/80"
                  />
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}

                <DialogFooter className="mt-2 flex gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSaving}
                  >
                    Avbryt
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Sparar..." : "Spara ändringar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className="mt-1 max-h-24 overflow-hidden whitespace-pre-wrap text-xs text-slate-600">
        {note.content}
      </p>
    </article>
  );
}
