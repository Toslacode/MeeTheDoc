"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, MessagesSquare, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

/**
 * One navigation for every breakpoint: bottom-anchored, thumb-reachable.
 *
 * The doctor uses this standing on a ward round far more than at a desk, so
 * the controls belong under the thumb rather than in a rail that only
 * desktop ever sees. On wide screens it becomes a floating centred pill
 * instead of stretching edge-to-edge — a full-width bar across 1440px reads
 * as admin-panel chrome, which is the exact feel this product avoids.
 *
 * Active state is carried by a filled pill behind the icon, not by colour
 * alone: shape survives glare, colour-blindness, and a phone held at arm's
 * length in a corridor.
 */
function DoctorBottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="ניווט ראשי"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40",
        "pb-[env(safe-area-inset-bottom)]",
        // Phone: edge-to-edge bar. Desktop: centred floating pill.
        "border-border bg-card/92 border-t backdrop-blur-md",
        "sm:inset-x-auto sm:start-1/2 sm:bottom-6 sm:-translate-x-1/2 sm:rtl:translate-x-1/2",
        "sm:rounded-xl sm:border sm:shadow-card-hover"
      )}
    >
      <ul className="mx-auto flex max-w-md items-stretch sm:max-w-none sm:gap-1 sm:p-1.5">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1 sm:flex-none">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-3",
                  "text-xs font-semibold",
                  "transition-[color,background-color,transform] duration-150 ease-out",
                  "active:scale-[0.96]",
                  "outline-none focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:ring-inset",
                  "sm:min-h-11 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm",
                  active
                    ? "text-primary bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon
                  className="size-5 sm:size-4.5"
                  strokeWidth={active ? 2.4 : 1.9}
                  aria-hidden
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { DoctorBottomNav };
