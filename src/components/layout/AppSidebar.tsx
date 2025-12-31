import * as React from "react";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/get-current-user";
import { AppSidebarUser } from "./AppSidebarUser";
import { AppSidebarNav } from "./AppSidebarNav";

export async function AppSidebar() {
  const user = await getCurrentUser();
  const email = user?.email ?? null;

  return (
    <aside
      className={cn(
        "hidden md:flex",
        "sticky h-[calc(100dvh-4rem)] w-60 shrink-0",
        "flex-col justify-between",
        "rounded-r-4xl border-r border-white/70 bg-white/60",
        "shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl",
        "px-4 py-6 mt-8"
      )}
    >
      {/* Övre del */}
      <div className="space-y-6">
        <div className="px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Family &amp; Friends
          </p>
          <p className="text-sm font-semibold text-[#3b4a5c]">Organizer</p>
        </div>

        {/* NAV (client) */}
        <AppSidebarNav />
      </div>

      {/* Nedre del (client) */}
      <div className="mt-4 border-t border-white/80 pt-4">
        <AppSidebarUser email={email} />
      </div>
    </aside>
  );
}
