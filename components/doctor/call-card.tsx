"use client";

import { Building2, Phone, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Time } from "@/components/ui/time";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS_LABELS, MEETING_TYPE_LABELS, TOPIC_LABELS } from "@/types";
import type { Booking } from "@/types";

const MEETING_ICON = {
  google_meet: Video,
  phone: Phone,
  in_person: Building2,
} as const;

/** Family surname from the contact's full name, for the "משפחת X" heading. */
function familyLabel(contactName: string): string {
  const parts = contactName.trim().split(/\s+/);
  return parts.length > 1 ? `משפחת ${parts[parts.length - 1]}` : contactName;
}

function CallCard({
  booking,
  onOpen,
  index = 0,
}: {
  booking: Booking;
  onOpen: () => void;
  index?: number;
}) {
  const MeetingIcon = MEETING_ICON[booking.meetingType];
  const isDone = booking.status !== "scheduled";

  return (
    <article
      style={{ animationDelay: `${index * 60}ms` }}
      className={cn(
        "border-border bg-card shadow-card animate-fade-in-up rounded-xl border p-4",
        "transition-[box-shadow,transform,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5",
        isDone && "opacity-72"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1">
          <Time className="text-foreground text-xl leading-none font-extrabold">
            {booking.startTime}
          </Time>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-foreground text-base font-bold">
              {familyLabel(booking.familyContactName)}
            </h3>
            <Badge variant={booking.status} withDot>
              {BOOKING_STATUS_LABELS[booking.status]}
            </Badge>
          </div>

          <p className="text-muted-foreground mt-1 text-sm">
            מטופל: <span className="text-foreground font-medium">{booking.patientName}</span>
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            נושא: <span className="text-foreground font-medium">{TOPIC_LABELS[booking.topic]}</span>
          </p>

          <span className="text-muted-foreground mt-2 inline-flex items-center gap-1.5 text-xs font-semibold">
            <MeetingIcon className="size-3.5" aria-hidden />
            {MEETING_TYPE_LABELS[booking.meetingType]}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2.5">
        <Button variant="outline" size="sm" onClick={onOpen} className="flex-1 sm:flex-none">
          פרטי השיחה
        </Button>
        {booking.meetingType === "google_meet" && booking.status === "scheduled" ? (
          <Button size="sm" className="flex-1 sm:flex-none">
            <Video aria-hidden />
            הצטרף
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export { CallCard, familyLabel };
