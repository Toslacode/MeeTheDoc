"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, MessagesSquare, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MeeTheDocLogo } from "@/components/brand/meethedoc-logo";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ITEMS: NavItem[] = [
  { href: "/doctor/calls", label: "השיחות שלי", icon: MessagesSquare },
  { href: "/doctor/availability", label: "זמינות", icon: CalendarClock },
  { href: "/doctor/profile", label: "פרופיל", icon: UserRound },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop: a quiet vertical rail. Hidden on phones, where the bottom bar
 * takes over — a sidebar would eat a third of a phone screen. */
function DoctorSidebar() {
  const isActive = useIsActive();

  return (
    <aside className="border-border bg-card hidden w-60 shrink-0 flex-col border-e px-3 py-6 md:flex">
      <Link
        href="/doctor/calls"
        className="mb-7 flex items-center gap-2.5 px-2 outline-none focus-visible:ring-ring focus-visible:ring-[3px] rounded-md"
      >
        <MeeTheDocLogo size="sm" />
        <span className="text-foreground text-lg font-extrabold">MeeTheDoc</span>
      </Link>

      <nav className="flex flex-col gap-1" aria-label="ניווט ראשי">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold",
                "transition-colors duration-150",
                "outline-none focus-visible:ring-ring focus-visible:ring-[3px]",
                active
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4.5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/** Phone: fixed bottom bar, safe-area aware. */
function DoctorBottomNav() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="ניווט ראשי"
      className={cn(
        "border-border bg-card/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur",
        "grid grid-cols-3 pb-[env(safe-area-inset-bottom)] md:hidden"
      )}
    >
      {ITEMS.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-15 flex-col items-center justify-center gap-1 text-xs font-semibold",
              "transition-colors duration-150",
              "outline-none focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:ring-inset",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("size-5.5", active && "scale-110")} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { DoctorSidebar, DoctorBottomNav };
