// app/notes/page.tsx
import { getChecklists } from "../checklists/actions";
import { getNotes } from "./actions";
import { NewChecklistDialog } from "@/components/notes/NewChecklistDialog";
import { NewNoteDialog } from "@/components/notes/NewNoteDialog";
import { ChecklistCard } from "@/components/notes/ChecklistCard";
import { NoteCard } from "@/components/notes/NoteCard";

export default async function NotesPage() {
  const [checklistsResult, notesResult] = await Promise.all([
    getChecklists(),
    getNotes(),
  ]);

  const hasError = !checklistsResult.success || !notesResult.success;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_#dbe7f3,_#c5d7e6_45%,_#eef2f7_100%)] px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="mb-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[#3b4a5c]">
            Listor &amp; anteckningar
          </h1>
          <p className="text-sm text-slate-600">
            Samla checklistor och fria anteckningar på ett och samma ställe.
          </p>
        </header>

        {hasError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive backdrop-blur-md">
            {!checklistsResult.success && <p>{checklistsResult.error}</p>}
            {!notesResult.success && <p>{notesResult.error}</p>}
          </div>
        )}

        <div className="rounded-[1.75rem] border border-white/70 bg-white/50 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-lg">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Checklistor */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-medium text-[#3b4a5c]">
                    Checklistor
                  </h2>
                  <p className="text-xs text-slate-600">
                    Shoppinglistor, packlistor och andra att-göra-listor.
                  </p>
                </div>
                <NewChecklistDialog />
              </div>

              <div className="space-y-3">
                {checklistsResult.success &&
                  checklistsResult.data.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300/70 bg-white/60 px-4 py-3 text-sm text-slate-500 backdrop-blur-sm">
                      Du har inga checklistor ännu. Skapa din första lista för
                      att komma igång.
                    </div>
                  )}

                {checklistsResult.success &&
                  checklistsResult.data.map((list) => (
                    <ChecklistCard key={list.id} checklist={list} />
                  ))}
              </div>
            </section>

            {/* Anteckningar */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-medium text-[#3b4a5c]">
                    Anteckningar
                  </h2>
                  <p className="text-xs text-slate-600">
                    Snabba minnesanteckningar, idéer och annat du vill spara.
                  </p>
                </div>
                <NewNoteDialog />
              </div>

              <div className="space-y-3">
                {notesResult.success && notesResult.data.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300/70 bg-white/60 px-4 py-3 text-sm text-slate-500 backdrop-blur-sm">
                    Du har inga anteckningar ännu. Skapa en ny för att komma
                    igång.
                  </div>
                )}

                {notesResult.success &&
                  notesResult.data.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
