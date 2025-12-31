"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CheckSquare, Home, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const items: NavItem[] = [
  { label: "Översikt", href: "/", icon: Home },
  { label: "Kalender", href: "/calendar", icon: CalendarDays },
  { label: "Todo's", href: "/todos", icon: CheckSquare },
  { label: "Listor & anteckningar", href: "/notes", icon: ListChecks },
];

export function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Huvudmeny">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
              "text-slate-600 hover:text-[#3b4a5c]",
              "hover:bg-white/90 hover:shadow-[0_8px_20px_rgba(15,23,42,0.12)]",
              "border border-transparent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FAEC9] focus-visible:ring-offset-2",
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
  );
}
