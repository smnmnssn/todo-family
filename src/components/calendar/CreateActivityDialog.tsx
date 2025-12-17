"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createActivity } from "../../app/calendar/actions";
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
import { Checkbox } from "@/components/ui/checkbox";

interface CreateActivityDialogProps {
  /** Förifyllt datum i formatet YYYY-MM-DD */
  date: string;
}

export function CreateActivityDialog({ date }: CreateActivityDialogProps) {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [allDay, setAllDay] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Aktiviteten måste ha en titel.");
      return;
    }

    if (!allDay && startTime && endTime && startTime > endTime) {
      setError("Starttid kan inte vara senare än sluttid.");
      return;
    }

    setLoading(true);

    const result = await createActivity({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime: allDay ? undefined : startTime || undefined,
      endTime: allDay ? undefined : endTime || undefined,
      allDay,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setAllDay(false);

    setOpen(false);
    router.refresh();
  }

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          Ny aktivitet
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-lg rounded-3xl border border-white/70 bg-white/80 px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md"
      >
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-semibold text-[#3b4a5c]">
            Ny aktivitet
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            Skapa en aktivitet för <span className="font-medium">{date}</span>.
            Du kan ange tid eller markera den som heldagsaktivitet.
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
              placeholder="Ex. Judoträning Lukas"
              autoFocus
              className="bg-white/70"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3b4a5c]">
              Beskrivning{" "}
              <span className="text-xs text-muted-foreground">(valfri)</span>
            </label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Valfri extra information..."
              rows={3}
              className="bg-white/70"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3b4a5c]">
              Datum
            </label>
            <Input
              type="date"
              value={date}
              onChange={() => {
              }}
              disabled
              className="bg-white/60 text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="create-all-day"
                checked={allDay}
                onCheckedChange={(checked) => setAllDay(Boolean(checked))}
              />
              <label
                htmlFor="create-all-day"
                className="text-sm text-slate-700"
              >
                Heldagsaktivitet
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#3b4a5c]">
                  Starttid
                </label>
                <Input
                  type="time"
                  value={startTime}
                  disabled={allDay}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="bg-white/70"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#3b4a5c]">
                  Sluttid
                </label>
                <Input
                  type="time"
                  value={endTime}
                  disabled={allDay}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="bg-white/70"
                />
              </div>
            </div>
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
              {loading ? "Skapar..." : "Spara aktivitet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
