"use client";

import { useState } from "react";
import { createTodoList } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateListForm() {
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const res = await createTodoList({ title });
  if (res.success) {
    setTitle("");
    setOpen(false);
  }
}

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        Ny lista
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Lista..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Button type="submit">Spara</Button>
      <Button variant="ghost" onClick={() => setOpen(false)}>Avbryt</Button>
    </form>
  );
}
