"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ChecklistDTO } from "../checklists/actions";
import {
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklist,
  deleteChecklistItem,
} from "../checklists/actions";
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
  const [loadingToggleId, setLoadingToggleId] = React.useState<string | null>(
    null,
  );
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
    <article className="rounded-xl border bg-background/60 px-4 py-3 text-sm shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-medium">{checklist.title}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDeleteChecklist}
          disabled={loadingDelete}
        >
          {loadingDelete ? "Tar bort..." : "Radera"}
        </Button>
      </div>

      {checklist.items.length === 0 ? (
        <p className="mb-2 text-xs text-muted-foreground">
          Inga punkter ännu. Lägg till din första punkt nedan.
        </p>
      ) : (
        <ul className="mb-3 space-y-1 text-xs">
          {checklist.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2"
            >
              <button
                type="button"
                onClick={() => handleToggleItem(item.id)}
                className="flex flex-1 items-center gap-2 text-left"
                disabled={loadingToggleId === item.id}
              >
                <Checkbox
                  checked={item.done}
                  onCheckedChange={() => handleToggleItem(item.id)}
                  disabled={loadingToggleId === item.id}
                />
                <span
                  className={
                    item.done
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }
                >
                  {item.text}
                </span>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => handleDeleteItem(item.id)}
                disabled={loadingDeleteItemId === item.id}
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
          onChange={(event) => setNewItemText(event.target.value)}
          placeholder="Lägg till punkt..."
          className="h-8 text-xs"
        />
        <Button type="submit" size="sm" disabled={loadingItem}>
          {loadingItem ? "Lägger till..." : "Lägg till"}
        </Button>
      </form>

      {error && (
        <p className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </article>
  );
}
