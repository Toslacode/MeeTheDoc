"use client";

import { Building2, Check, Mail, Phone, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Time } from "@/components/ui/time";
import { formatHebrewDate, formatRelativeDay } from "@/lib/format";
import { MEETING_TYPE_LABELS, TOPIC_LABELS } from "@/types";
import type { Booking, Doctor } from "@/types";

/** What happens next, phrased per conversation type — the family should
 * never have to guess how the call will actually reach them. */
const NEXT_STEP: Record<Booking["meetingType"], { text: string; icon: typeof Video }> = {
  google_meet: {
    text: "קישור Google Meet יישלח אליכם במייל",
    icon: Video,
  },
  phone: {
    text: "הרופא ייצור איתכם קשר במספר שהזנתם",
    icon: Phone,
  },
  in_person: {
    text: "השיחה תתקיים במחלקה בשעה שנבחרה",
    icon: Building2,
  },
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-border/70 flex items-center justify-between gap-4 border-b py-2.5 last:border-b-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground text-sm font-semibold">{value}</span>
    </div>
  );
}

function BookingSuccess({
  booking,
  doctor,
  onDone,
}: {
  booking: Booking;
  doctor: Doctor;
  onDone: () => void;
}) {
  const next = NEXT_STEP[booking.meetingType];
  const NextIcon = next.icon;

  return (
    <div className="flex flex-col items-center text-center">
      <span className="bg-primary shadow-card animate-success-check flex size-18 items-center justify-center rounded-full">
        <Check className="size-9 stroke-[3] text-white" aria-hidden />
      </span>

      <h1 className="text-foreground animate-fade-in-up mt-5 text-2xl font-extrabold [animation-delay:120ms]">
        השיחה נקבעה בהצלחה
      </h1>
      <p className="text-muted-foreground animate-fade-in-up mt-1.5 text-sm [animation-delay:160ms]">
        {formatRelativeDay(booking.date)} · {formatHebrewDate(booking.date)}
      </p>

      <div className="border-border bg-card shadow-card animate-fade-in-up mt-6 w-full rounded-xl border p-4 text-start [animation-delay:200ms] sm:p-5">
        <Row label="רופא" value={doctor.name} />
        <Row label="שעה" value={<Time>{booking.startTime}</Time>} />
        <Row label="סוג שיחה" value={MEETING_TYPE_LABELS[booking.meetingType]} />
        <Row label="נושא" value={TOPIC_LABELS[booking.topic]} />
        <Row label="מטופל" value={booking.patientName} />
      </div>

      <div className="glass-surface relative bg-secondary/55 border-primary/12 animate-fade-in-up mt-4 flex w-full items-start gap-2.5 rounded-lg border px-4 py-3 text-start [animation-delay:250ms]">
        <NextIcon className="text-primary mt-0.5 size-4.5 shrink-0" aria-hidden />
        <p className="text-foreground text-sm font-medium">{next.text}</p>
      </div>

      <p className="text-muted-foreground animate-fade-in-up mt-3.5 flex items-center gap-2 text-sm [animation-delay:290ms]">
        <Mail className="size-4" aria-hidden />
        נשלח אישור לכתובת <span dir="ltr">{booking.email}</span>
      </p>

      <Button
        variant="outline"
        onClick={onDone}
        className="animate-fade-in-up mt-6 [animation-delay:330ms]"
      >
        קביעת שיחה נוספת
      </Button>
    </div>
  );
}

export { BookingSuccess };
