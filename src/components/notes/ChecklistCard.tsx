"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ChecklistDTO } from "../../app/(app)/checklists/actions";
import {
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklist,
  deleteChecklistItem,
} from "../../app/(app)/checklists/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface ChecklistCardProps {
  checklist: ChecklistDTO;
}

export function ChecklistCard({ checklist }: ChecklistCardProps) {
  const router = useRouter();
  const [newItemText, setNewItemText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loadingItem, setLoadingItem] = React.useState(false);
  const [loadingDelete, setLoadingDelete] = React.useState(false);
  const [loadingToggleId, setLoadingToggleId] =
    React.useState<string | null>(null);
  const [loadingDeleteItemId, setLoadingDeleteItemId] =
    React.useState<string | null>(null);

  async function handleAddItem(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    if (!newItemText.trim()) {
      setError("Punkten måste ha en text.");
      return;
    }

    setLoadingItem(true);

    const result = await addChecklistItem({
      checklistId: checklist.id,
      text: newItemText.trim(),
    });

    setLoadingItem(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setNewItemText("");
    router.refresh();
  }

  async function handleToggleItem(id: string): Promise<void> {
    setError(null);
    setLoadingToggleId(id);

    const result = await toggleChecklistItem({ id });

    setLoadingToggleId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  async function handleDeleteChecklist(): Promise<void> {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort hela checklistan?",
    );
    if (!confirmed) return;

    setError(null);
    setLoadingDelete(true);

    const result = await deleteChecklist({ id: checklist.id });

    setLoadingDelete(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  async function handleDeleteItem(id: string): Promise<void> {
    setError(null);
    setLoadingDeleteItemId(id);

    const result = await deleteChecklistItem({ id });

    setLoadingDeleteItemId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <article className="rounded-3xl border border-white/40 bg-white/10 px-4 py-3 text-sm shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-sm font-semibold text-slate-900">
          {checklist.title}
        </h3>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDeleteChecklist}
          disabled={loadingDelete}
          className="h-8 rounded-full border-white/40 bg-white/20 text-xs hover:bg-white/30"
        >
          {loadingDelete ? "Tar bort..." : "Ta bort lista"}
        </Button>
      </div>

      {checklist.items.length === 0 ? (
        <p className="mb-3 text-xs text-slate-700/80">
          Inga punkter ännu. Lägg till din första punkt nedan.
        </p>
      ) : (
        <ul className="mb-3 space-y-1 text-xs">
          {checklist.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <div className="flex flex-1 items-center gap-2">
                <Checkbox
                  checked={item.done}
                  aria-label="Markera som klar"
                  onCheckedChange={() => handleToggleItem(item.id)}
                  disabled={loadingToggleId === item.id}
                  className="h-3.5 w-3.5"
                />
                <button
                  type="button"
                  onClick={() => handleToggleItem(item.id)}
                  disabled={loadingToggleId === item.id}
                  className="flex-1 text-left"
                >
                  <span
                    className={
                      item.done
                        ? "line-through text-slate-600/70"
                        : "text-slate-900"
                    }
                  >
                    {item.text}
                  </span>
                </button>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteItem(item.id)}
                disabled={loadingDeleteItemId === item.id}
                className="h-8 w-8 rounded-full border border-transparent bg-transparent p-0 text-slate-700/70 hover:border-white/30 hover:bg-white/15 hover:text-slate-900"
                aria-label="Ta bort punkt"
              >
                ✕
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddItem} className="mt-2 flex gap-2">
        <Input
          value={newItemText}
          aria-label="Skapa ny uppgift"
          onChange={(event) => setNewItemText(event.target.value)}
          placeholder="Lägg till punkt..."
          className="h-9 rounded-2xl bg-white/70 text-xs"
        />
        <Button type="submit" size="sm" disabled={loadingItem} className="h-9 rounded-2xl px-3 text-xs">
          {loadingItem ? "Lägger till..." : "Lägg till"}
        </Button>
      </form>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </article>
  );
}
