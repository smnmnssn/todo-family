"use client";

import * as React from "react";
import { useState } from "react";
import { createTodo } from "@/app/todos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateTodoFormProps {
  listId: string;
}

export default function CreateTodoForm({ listId }: CreateTodoFormProps) {
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await createTodo({ title, listId });
    if (res.success) {
      setTitle("");
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Ny todo
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        className="h-8"
        placeholder="Todo..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Button size="sm" type="submit">
        Spara
      </Button>
      <Button
        size="sm"
        variant="ghost"
        type="button"
        onClick={() => setOpen(false)}
      >
        Avbryt
      </Button>
    </form>
  );
}
