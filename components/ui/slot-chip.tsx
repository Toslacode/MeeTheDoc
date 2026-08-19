"use client";

import { cn } from "@/lib/utils";

/**
 * The single most-used control in the product: a 15-minute time slot the
 * family taps to choose, and the doctor taps to publish. Selected state is
 * a solid blue fill, matching the approved references.
 *
 * `aria-pressed` (not `aria-selected`) because this is a toggle button, and
 * min-h-13 keeps it a comfortable phone target.
 */
function SlotChip({
  time,
  selected = false,
  disabled = false,
  onToggle,
  className,
}: {
  time: string;
  selected?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      dir="ltr"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "min-h-13 rounded-md border text-base font-semibold tabular-nums",
        "transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "outline-none focus-visible:ring-ring focus-visible:ring-[3px]",
        "active:scale-97",
        selected
          ? "border-primary bg-primary text-primary-foreground scale-103 shadow-card"
          : "border-input bg-card text-foreground hover:border-primary/35 hover:bg-secondary/45",
        disabled && "cursor-not-allowed opacity-40 hover:border-input hover:bg-card",
        className
      )}
    >
      {time}
    </button>
  );
}

export { SlotChip };
