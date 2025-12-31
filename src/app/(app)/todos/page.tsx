// app/todos/page.tsx
import { getTodoLists } from "./actions";
import TodoList from "../../../components/todos/TodoList";
import CreateListDialog from "@/components/todos/CreateListDialog";

export default async function TodosPage() {
  const result = await getTodoLists();

  if (!result.success) {
    return (
      <div className="w-full p-4 md:p-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-[32px] border border-white/40 bg-white/10 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
            <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive shadow-[0_10px_24px_rgba(15,23,42,0.10)] backdrop-blur-md">
              {result.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lists = result.data;

  return (
    <div className="w-full p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-[32px] border border-white/40 bg-white/10 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
          <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Todos
              </h1>
              <p className="text-sm text-slate-700/80">
                Organisera familjens att-göra-listor på ett ställe.
              </p>
            </div>

            <div className="w-full md:w-auto">
              <div className="inline-flex w-full justify-start md:w-auto">
                  <CreateListDialog />
              </div>
            </div>
          </header>

          {lists.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/40 bg-white/10 px-6 py-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-md">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full border border-white/40 bg-white/20 p-3 shadow-sm backdrop-blur-md">
                  <svg
                    className="size-6 text-slate-800"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </div>

                <p className="text-sm text-slate-700/80">
                  Du har inga listor ännu. Skapa din första lista för att komma
                  igång.
                </p>

                  <CreateListDialog />
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {lists.map((list) => (
                <TodoList key={list.id} list={list} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
