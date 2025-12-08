"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { NoteDTO } from "./actions";
import { updateNote, deleteNote } from "./actions";
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
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  function resetForm(): void {
    setTitle(note.title);
    setContent(note.content);
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
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

    setSaving(true);

    const result = await updateNote({
      id: note.id,
      title: title.trim(),
      content: content.trim(),
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  async function handleDelete(): Promise<void> {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort den här anteckningen?",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    const result = await deleteNote({ id: note.id });

    setDeleting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <article className="rounded-xl border bg-background/60 px-4 py-3 text-sm shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-medium">{note.title}</h3>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Tar bort..." : "Radera"}
          </Button>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button type="button" size="sm">
                Redigera
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Redigera anteckning</DialogTitle>
                <DialogDescription>
                  Uppdatera titel eller innehåll för anteckningen.
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
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Innehåll
                  </label>
                  <Textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    rows={4}
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
                  <Button type="submit" disabled={saving}>
                    {saving ? "Sparar..." : "Spara ändringar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className="mt-1 max-h-24 overflow-hidden text-xs text-muted-foreground whitespace-pre-wrap">
        {note.content}
      </p>
    </article>
  );
}
