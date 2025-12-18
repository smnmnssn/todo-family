"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActivityDTO } from "../../app/calendar/actions";
import { updateActivity, deleteActivity } from "../../app/calendar/actions";
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

type EditActivityDialogProps = {
  activity: ActivityDTO;
};

export function EditActivityDialog({ activity }: EditActivityDialogProps) {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);

  const [title, setTitle] = React.useState(activity.title);
  const [description, setDescription] = React.useState(activity.description ?? "");
  const [date, setDate] = React.useState(activity.date);
  const [startTime, setStartTime] = React.useState(activity.startTime ?? "");
  const [endTime, setEndTime] = React.useState(activity.endTime ?? "");
  const [allDay, setAllDay] = React.useState(activity.allDay);

  const [error, setError] = React.useState<string | null>(null);

  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function resetForm(): void {
    setTitle(activity.title);
    setDescription(activity.description ?? "");
    setDate(activity.date);
    setStartTime(activity.startTime ?? "");
    setEndTime(activity.endTime ?? "");
    setAllDay(activity.allDay);
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
      setError("Aktiviteten måste ha en titel.");
      return;
    }

    if (!allDay && startTime && endTime && startTime > endTime) {
      setError("Starttid kan inte vara senare än sluttid.");
      return;
    }

    startSave(async () => {
      const result = await updateActivity({
        id: activity.id,
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        startTime: allDay ? undefined : startTime || undefined,
        endTime: allDay ? undefined : endTime || undefined,
        allDay,
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
      "Är du säker på att du vill ta bort den här aktiviteten?"
    );
    if (!confirmed) return;

    setError(null);

    startDelete(async () => {
      const result = await deleteActivity({ id: activity.id });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Redigera
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-3xl border border-white/70 bg-white/80 px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-semibold text-[#3b4a5c]">
            Redigera aktivitet
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            Ändra informationen för den här aktiviteten eller ta bort den helt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3b4a5c]">Titel</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
              className="bg-white/70"
              disabled={isSaving || isDeleting}
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
              rows={3}
              className="bg-white/70"
              disabled={isSaving || isDeleting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3b4a5c]">Datum</label>
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="bg-white/70"
              disabled={isSaving || isDeleting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`edit-all-day-${activity.id}`}
                checked={allDay}
                onCheckedChange={(checked) => setAllDay(Boolean(checked))}
                disabled={isSaving || isDeleting}
              />
              <label htmlFor={`edit-all-day-${activity.id}`} className="text-sm text-slate-700">
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
                  disabled={allDay || isSaving || isDeleting}
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
                  disabled={allDay || isSaving || isDeleting}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="bg-white/70"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
            >
              {isDeleting ? "Tar bort..." : "Ta bort"}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSaving || isDeleting}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSaving || isDeleting}>
                {isSaving ? "Sparar..." : "Spara ändringar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
