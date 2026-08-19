"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, MessagesSquare, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useSlidingIndicator } from "@/lib/use-sliding-indicator";
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
 * Active state is carried by a filled, sliding glass pill behind the icon,
 * not by colour alone: shape survives glare, colour-blindness, and a phone
 * held at arm's length in a corridor. The pill itself moves between tabs
 * (useSlidingIndicator) rather than just recoloring, which is the single
 * highest-visibility motion cue in the app — this nav sits on every doctor
 * screen.
 */
function DoctorBottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const activeItem = ITEMS.find((item) => isActive(item.href)) ?? ITEMS[0];
  const { indicatorRect, registerItem } = useSlidingIndicator(activeItem.href);

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
      <ul className="relative mx-auto flex max-w-md items-stretch sm:max-w-none sm:gap-1 sm:p-1.5">
        {indicatorRect ? (
          <span
            aria-hidden
            className="glass-surface border border-[color:var(--glass-border)] bg-secondary/75 pointer-events-none absolute top-1.5 bottom-1.5 rounded-md transition-[inset-inline-start,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              insetInlineStart: indicatorRect.insetInlineStart,
              width: indicatorRect.width,
            }}
          />
        ) : null}

        {ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1 sm:flex-none">
              <Link
                ref={registerItem(item.href)}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-3",
                  "text-xs font-semibold",
                  "transition-[color,transform] duration-150 ease-out",
                  "active:scale-[0.96]",
                  "outline-none focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:ring-inset",
                  "sm:min-h-11 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
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
