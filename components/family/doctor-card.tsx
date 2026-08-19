"use client";

import { ChevronLeft } from "lucide-react";

import { doctorInitials, pluralSlots } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Doctor } from "@/types";

/**
 * One doctor in the family's choose-a-doctor list. Shows only what a
 * family is allowed to know: who the doctor is, their specialty, and HOW
 * MANY slots they published — never which slots, never why they're
 * unavailable, never anyone else's booking.
 */
function DoctorCard({
  doctor,
  availableCount,
  onSelect,
  index = 0,
}: {
  doctor: Doctor;
  availableCount: number;
  onSelect: () => void;
  index?: number;
}) {
  const hasSlots = availableCount > 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ animationDelay: `${index * 70}ms` }}
      className={cn(
        "group border-border bg-card shadow-card w-full rounded-xl border p-4",
        "flex items-center gap-4 text-start",
        "animate-fade-in-up",
        "transition-[box-shadow,transform,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:shadow-card-hover hover:border-primary/25 hover:-translate-y-0.5",
        "active:translate-y-0 active:scale-[0.995]",
        "outline-none focus-visible:ring-ring focus-visible:ring-[3px]"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "bg-secondary text-primary flex size-13 shrink-0 items-center justify-center",
          "rounded-full text-lg font-bold"
        )}
      >
        {doctorInitials(doctor.name)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-foreground block text-lg font-bold">
          {doctor.name}
        </span>
        <span className="text-muted-foreground block text-sm">
          {doctor.specialty}
        </span>
        <span
          className={cn(
            "mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            hasSlots
              ? "bg-secondary text-primary"
              : "bg-[#f1f3f7] text-muted-foreground"
          )}
        >
          {hasSlots ? <span className="bg-primary size-1.5 rounded-full" /> : null}
          {pluralSlots(availableCount)}
        </span>
      </span>

      <ChevronLeft
        aria-hidden
        className={cn(
          "text-muted-foreground/60 size-5 shrink-0",
          "transition-transform duration-200 group-hover:-translate-x-0.5",
          "rtl:rotate-0"
        )}
      />
    </button>
  );
}

export { DoctorCard };
