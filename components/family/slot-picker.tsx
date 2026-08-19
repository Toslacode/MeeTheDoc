"use client";

import { CalendarClock, Info } from "lucide-react";

import { SlotChip } from "@/components/ui/slot-chip";
import { formatRelativeDay, groupSlotsByDate } from "@/lib/format";
import type { AvailabilitySlot } from "@/types";

/**
 * Shows only the slots handed to it. It never receives, and so cannot
 * leak, unpublished or already-booked time — lib/store/api.ts
 * `listPublishedSlots` filters that upstream.
 */
function SlotPicker({
  slots,
  selectedSlotId,
  onSelect,
}: {
  slots: AvailabilitySlot[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
}) {
  if (slots.length === 0) {
    return (
      <div className="border-border bg-card shadow-card animate-fade-in-up rounded-xl border p-8 text-center">
        <span className="bg-secondary text-primary mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
          <CalendarClock className="size-6.5" aria-hidden />
        </span>
        <p className="text-foreground text-lg font-bold">כרגע אין זמנים פנויים</p>
        <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-sm leading-relaxed">
          ניתן לחזור לקישור מאוחר יותר, הזמינות מתעדכנת במהלך היום.
        </p>
      </div>
    );
  }

  const groups = groupSlotsByDate(slots);

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group, groupIndex) => (
        <section
          key={group.date}
          className="border-border bg-card shadow-card animate-fade-in-up rounded-xl border p-5 sm:p-6"
          style={{ animationDelay: `${groupIndex * 80}ms` }}
        >
          <h2 className="text-foreground mb-3.5 flex items-center gap-2 text-base font-bold">
            <CalendarClock className="text-primary size-4.5" aria-hidden />
            {formatRelativeDay(group.date)}
          </h2>

          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {group.slots.map((slot) => (
              <SlotChip
                key={slot.id}
                time={slot.startTime}
                selected={slot.id === selectedSlotId}
                onToggle={() => onSelect(slot.id)}
              />
            ))}
          </div>
        </section>
      ))}

      <p className="text-muted-foreground flex items-start gap-2 px-1 text-xs leading-relaxed">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        מוצגים רק הזמנים שהרופא הגדיר כפנויים.
      </p>
    </div>
  );
}

export { SlotPicker };
