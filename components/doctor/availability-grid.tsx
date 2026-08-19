"use client";

import { SlotChip } from "@/components/ui/slot-chip";
import type { AvailabilitySlot } from "@/types";

/**
 * The doctor's own slot grid. Booked slots are shown but locked — a slot a
 * family already booked must not be silently retractable with a tap.
 */
function AvailabilityGrid({
  slots,
  selectedIds,
  onToggle,
}: {
  slots: AvailabilitySlot[];
  selectedIds: Set<string>;
  onToggle: (slotId: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
      {slots.map((slot) => {
        const booked = slot.bookingId !== null;
        return (
          <SlotChip
            key={slot.id}
            time={slot.startTime}
            selected={selectedIds.has(slot.id)}
            disabled={booked}
            onToggle={() => onToggle(slot.id)}
            className={booked ? "!opacity-100 border-primary/30 bg-secondary text-primary" : ""}
          />
        );
      })}
    </div>
  );
}

export { AvailabilityGrid };
