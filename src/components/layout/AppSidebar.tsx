"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  Home,
  ListChecks,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const defaultItems: NavItem[] = [
  {
    label: "Översikt",
    href: "/",
    icon: Home,
  },
  {
    label: "Kalender",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Todos",
    href: "/todos",
    icon: CheckSquare,
  },
  {
    label: "Listor & anteckningar",
    href: "/notes", // checklistor + anteckningar
    icon: ListChecks,
  },
];

interface AppSidebarProps {
  items?: NavItem[];
}

/**
 * Glasig blå sidebar anpassad till projektets styling.
 * - Fast på vänster sida på desktop
 * - Kan enkelt kompletteras med hamburger för mobil om du vill senare
 */
export function AppSidebar({ items = defaultItems }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex",
        "h-[calc(100vh-4rem)] w-60 shrink-0", // 4rem = headerhöjd om du har det
        "flex-col justify-between",
        "rounded-r-[2rem] border-r border-white/70 bg-white/60",
        "shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl",
        "px-4 py-6"
      )}
    >
      {/* Övre del: logo / titel + navigation */}
      <div className="space-y-6">
        <div className="px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Family &amp; Friends
          </p>
          <p className="text-sm font-semibold text-[#3b4a5c]">
            Organizer
          </p>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
                  "text-slate-600 hover:text-[#3b4a5c]",
                  "hover:bg-white/90 hover:shadow-[0_8px_20px_rgba(15,23,42,0.12)]",
                  "border border-transparent",
                  isActive &&
                    "border-[#8FAEC9] bg-white/95 text-[#2e3f55] shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#c5d7e6]/60">
                  <Icon className="h-3.5 w-3.5 text-[#3b4a5c]" />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Nedre del: t.ex. user-info / settings */}
      <div className="mt-4 border-t border-white/80 pt-4">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c5d7e6] text-xs font-semibold text-[#2e3f55]">
            F
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[#3b4a5c]">
              Family profile
            </p>
            <p className="truncate text-[11px] text-slate-500">
              Inställningar &amp; medlemskap
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
