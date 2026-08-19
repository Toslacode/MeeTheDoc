"use client";

import { Check, PhoneOff, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Time } from "@/components/ui/time";
import { familyLabel } from "@/components/doctor/call-card";
import { formatRelativeDay } from "@/lib/format";
import { BOOKING_STATUS_LABELS, MEETING_TYPE_LABELS, TOPIC_LABELS } from "@/types";
import type { Booking, BookingStatus } from "@/types";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-border/70 flex items-start justify-between gap-4 border-b py-2.5 last:border-b-0">
      <span className="text-muted-foreground shrink-0 text-sm">{label}</span>
      <span className="text-foreground text-end text-sm font-semibold">{value}</span>
    </div>
  );
}

function CallDetailsDialog({
  booking,
  onClose,
  onStatusChange,
}: {
  booking: Booking | null;
  onClose: () => void;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
}) {
  const open = booking !== null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        {booking ? (
          <>
            <div>
              <DialogTitle className="text-foreground text-xl font-extrabold">
                {familyLabel(booking.familyContactName)}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-sm">
                {formatRelativeDay(booking.date)} · <Time>{booking.startTime}</Time>
              </DialogDescription>
            </div>

            <div className="border-border bg-background/60 rounded-lg border px-4 py-1">
              <Row label="מטופל" value={booking.patientName} />
              <Row label="בן/בת משפחה" value={booking.familyContactName} />
              <Row label="טלפון" value={<span dir="ltr">{booking.phone}</span>} />
              <Row label="אימייל" value={<span dir="ltr">{booking.email}</span>} />
              <Row label="סוג שיחה" value={MEETING_TYPE_LABELS[booking.meetingType]} />
              <Row label="נושא" value={TOPIC_LABELS[booking.topic]} />
              <Row
                label="סטטוס"
                value={
                  <Badge variant={booking.status} withDot>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </Badge>
                }
              />
            </div>

            {booking.notes ? (
              <div className="bg-secondary/60 border-primary/12 rounded-lg border px-4 py-3">
                <p className="text-muted-foreground mb-1 text-xs font-semibold">
                  מידע נוסף מהמשפחה
                </p>
                <p className="text-foreground text-sm leading-relaxed">{booking.notes}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-2.5">
              {booking.meetingType === "google_meet" ? (
                <Button className="w-full">
                  <Video aria-hidden />
                  הצטרף לשיחה
                </Button>
              ) : null}

              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={booking.status === "completed"}
                  onClick={() => onStatusChange(booking.id, "completed")}
                >
                  <Check aria-hidden />
                  סמן כבוצע
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={booking.status === "no_answer"}
                  onClick={() => onStatusChange(booking.id, "no_answer")}
                >
                  <PhoneOff aria-hidden />
                  לא נענה
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export { CallDetailsDialog };
