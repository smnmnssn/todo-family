"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface AppSidebarUserProps {
  email: string | null;
}

export function AppSidebarUser({ email }: AppSidebarUserProps) {
  const [open, setOpen] = React.useState(false);

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="relative px-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left",
          "hover:bg-white/90 hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FAEC9]"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c5d7e6] text-xs font-semibold text-[#2e3f55]">
          {email ? email[0]?.toUpperCase() : "?"}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[#3b4a5c]">
            Inloggad som
          </p>
          <p className="truncate text-[11px] text-slate-500">
            {email ?? "Okänd användare"}
          </p>
        </div>
      </button>

      {open && (
        <div
          className={cn(
            "absolute bottom-full left-1 right-1 mb-2",
            "rounded-xl border border-white/80 bg-white/95 p-2",
            "shadow-[0_12px_30px_rgba(15,23,42,0.18)] backdrop-blur"
          )}
        >
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm",
              "text-red-600 hover:bg-red-50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            )}
          >
            <LogOut className="h-4 w-4" />
            Logga ut
          </button>
        </div>
      )}
    </div>
  );
}
