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
  <div className="mt-8 rounded-xl border bg-muted/40 px-6 py-10 text-center">
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-full bg-primary/10 p-3">
        <svg className="size-6 text-primary" 
             xmlns="http://www.w3.org/2000/svg" 
             viewBox="0 0 24 24" 
             fill="none" 
             stroke="currentColor" 
             strokeWidth="2">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
        </svg>
      </div>

      <p className="text-sm text-muted-foreground">
        Du har inga listor ännu. Skapa din första lista för att komma igång.
      </p>

      <CreateListDialog />
    </div>
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
