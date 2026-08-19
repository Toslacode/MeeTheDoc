"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A large, tappable choice card — used for conversation type and topic in
 * the family booking form. Deliberately not a <select>: on mobile a native
 * dropdown hides the options behind an extra tap and reads as generic
 * admin UI, which is exactly the feel this product is avoiding.
 */
function OptionCard({
  label,
  icon: Icon,
  selected = false,
  onSelect,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "glass-surface relative flex min-h-22 flex-col items-center justify-center gap-2 rounded-md border px-3 py-4",
        "text-center text-sm font-semibold",
        "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "outline-none focus-visible:ring-ring focus-visible:ring-[3px]",
        "active:scale-98",
        selected
          ? // Not a solid primary fill (that's bg-secondary, the soft-blue
            // tint family), so unlike a slot chip's selected state this
            // one has headroom to stay glass — the primary-colored
            // ring/icon still carries the selection signal.
            "border-primary bg-secondary/70 text-foreground ring-primary shadow-card ring-1 animate-chip-pop"
          : "border-[color:var(--glass-border)] bg-card/55 text-foreground hover:border-primary/35 hover:bg-secondary/40",
        className
      )}
    >
      {Icon ? (
        <Icon
          className={cn("size-5.5", selected ? "text-primary" : "text-muted-foreground")}
          aria-hidden
        />
      ) : null}
      {label}
    </button>
  );
}

export { OptionCard };
