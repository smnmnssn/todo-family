"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CalendarDays,
  CheckSquare,
  Home,
  ListChecks,
  UserRound,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const defaultItems: NavItem[] = [
  { label: "Översikt", href: "/", icon: Home },
  { label: "Kalender", href: "/calendar", icon: CalendarDays },
  { label: "Todo's", href: "/todos", icon: CheckSquare },
  { label: "Listor", href: "/notes", icon: ListChecks },
];

interface MobileNavProps {
  items?: NavItem[];
  emailLabel?: string;
}

export function MobileNav({ items = defaultItems, emailLabel }: MobileNavProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <nav
      aria-label="Mobilmeny"
      className={cn(
        "md:hidden",
        "fixed inset-x-0 bottom-0 z-50",
        "px-4 pt-3",
        "pb-[max(env(safe-area-inset-bottom),0.75rem)]"
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-md",
          "rounded-2xl border border-white/70 bg-white/55",
          "shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl"
        )}
      >
        <div className="flex items-stretch gap-1 p-1.5">
          <ul className="flex flex-1 items-stretch gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href} className="flex-1">
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex h-full flex-col items-center justify-center gap-1",
                      "rounded-xl px-2 py-2.5 text-[11px] font-medium",
                      "transition-all select-none",
                      "text-slate-600 hover:text-[#3b4a5c]",
                      "hover:bg-white/90 hover:shadow-[0_8px_20px_rgba(15,23,42,0.12)]",
                      "border border-transparent",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FAEC9] focus-visible:ring-offset-2",
                      isActive &&
                        "border-[#8FAEC9] bg-white/95 text-[#2e3f55] shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                    )}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c5d7e6]/60">
                      <Icon className="h-4 w-4 text-[#3b4a5c]" />
                    </span>
                    <span className="max-w-[72px] truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Profilmeny"
                className={cn(
                  "flex items-center justify-center",
                  "rounded-xl border border-transparent px-2",
                  "hover:bg-white/90 hover:shadow-[0_8px_20px_rgba(15,23,42,0.12)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FAEC9] focus-visible:ring-offset-2"
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c5d7e6]/70">
                  <UserRound className="h-5 w-5 text-[#3b4a5c]" />
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              side="top"
              sideOffset={10}
              className={cn(
                "w-56",
                "rounded-xl border border-white/70 bg-white/70",
                "shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl"
              )}
            >
              <div className="px-3 py-2">
                <p className="text-xs text-slate-500">Inloggad som</p>
                <p className="truncate text-sm font-medium text-slate-800">
                  {emailLabel ?? "—"}
                </p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  void handleLogout();
                }}
                className={cn(
                  "cursor-pointer",
                  "text-red-600 focus:text-red-700",
                  "focus:bg-red-50"
                )}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logga ut
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
