import { CalendarDays, Clock, Stethoscope } from "lucide-react";

import { Time } from "@/components/ui/time";
import { formatRelativeDay } from "@/lib/format";
import type { Doctor } from "@/types";

/** Keeps doctor / date / time visible while the family fills the form, so
 * they never have to go back to check what they picked. */
function BookingSummary({
  doctor,
  date,
  time,
}: {
  doctor: Doctor;
  date: string;
  time: string;
}) {
  return (
    <div className="glass-surface relative bg-secondary/55 border-primary/12 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border px-4 py-3">
      <span className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
        <Stethoscope className="text-primary size-4" aria-hidden />
        {doctor.name}
      </span>
      <span className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
        <CalendarDays className="text-primary size-4" aria-hidden />
        {formatRelativeDay(date)}
      </span>
      <span className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
        <Clock className="text-primary size-4" aria-hidden />
        <Time>{time}</Time>
      </span>
    </div>
  );
}

export { BookingSummary };
