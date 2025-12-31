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
    <div className="w-full p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* OUTER GLASS FRAME */}
        <div className="rounded-[32px] border border-white/40 bg-white/10 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Listor &amp; anteckningar
            </h1>
            <p className="text-sm text-slate-700/80">
              Samla checklistor och fria anteckningar på ett och samma ställe.
            </p>
          </header>

          {hasError && (
            <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive shadow-[0_10px_24px_rgba(15,23,42,0.10)] backdrop-blur-md">
              {!checklistsResult.success && <p>{checklistsResult.error}</p>}
              {!notesResult.success && <p>{notesResult.error}</p>}
            </div>
          )}

          {/* INNER GRID */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Checklistor */}
            <section className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium text-slate-900">
                    Checklistor
                  </h2>
                  <p className="text-xs text-slate-700/80">
                    Shoppinglistor, packlistor och andra att-göra-listor.
                  </p>
                </div>

                {/* INGEN wrapper runt knapp */}
                <NewChecklistDialog />
              </div>

              <div className="space-y-3">
                {checklistsResult.success &&
                  checklistsResult.data.length === 0 && (
                    <div className="rounded-3xl border border-white/40 bg-white/10 px-4 py-3 text-sm text-slate-700/80 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-md">
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
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium text-slate-900">
                    Anteckningar
                  </h2>
                  <p className="text-xs text-slate-700/80">
                    Snabba minnesanteckningar, idéer och annat du vill spara.
                  </p>
                </div>

                {/* INGEN wrapper runt knapp */}
                <NewNoteDialog />
              </div>

              <div className="space-y-3">
                {notesResult.success && notesResult.data.length === 0 && (
                  <div className="rounded-3xl border border-white/40 bg-white/10 px-4 py-3 text-sm text-slate-700/80 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-md">
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
