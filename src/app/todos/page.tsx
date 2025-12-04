// app/todos/page.tsx
import { getTodoLists } from "./actions";
import TodoList from "./TodoList";
import CreateListDialog from "./CreateListDialog";

export default async function TodosPage() {
  const result = await getTodoLists();

  if (!result.success) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {result.error}
        </p>
      </div>
    );
  }

  const lists = result.data;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Todos
          </h1>
          <p className="text-sm text-muted-foreground">
            Organisera familjens att-göra-listor på ett ställe.
          </p>
        </div>

        <CreateListDialog />
      </header>

      {lists.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
          Du har inga listor ännu. Skapa din första lista för att komma igång.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {lists.map((list) => (
            <TodoList key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}
