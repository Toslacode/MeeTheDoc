"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Info, Plus } from "lucide-react";

import { AvailabilityGrid } from "@/components/doctor/availability-grid";
import { Button } from "@/components/ui/button";
import { formatHebrewDate, todayIso } from "@/lib/format";
import { listSlotsForDoctor, setDayAvailability } from "@/lib/store/api";
import { useCurrentDoctorId, useStoreState } from "@/lib/store/context";
import type { AvailabilitySlot } from "@/types";

/** A realistic ward day at 15-minute granularity. */
const DAY_START_MINUTES = 8 * 60;
const DAY_END_MINUTES = 18 * 60;

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function buildDayTimes(): string[] {
  const times: string[] = [];
  for (let m = DAY_START_MINUTES; m < DAY_END_MINUTES; m += 15) {
    times.push(minutesToTime(m));
  }
  return times;
}

const DAY_TIMES = buildDayTimes();

const QUICK_RANGES = [
  { label: "09:00 → 10:30", from: "09:00", to: "10:30" },
  { label: "13:30 → 15:00", from: "13:30", to: "15:00" },
  { label: "16:00 → 17:30", from: "16:00", to: "17:30" },
];

function timesInRange(from: string, to: string): string[] {
  return DAY_TIMES.filter((t) => t >= from && t < to);
}

export default function DoctorAvailabilityPage() {
  const storeState = useStoreState();
  const currentDoctorId = useCurrentDoctorId();
  const today = todayIso();

  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [published, setPublished] = useState(false);

  // Load this doctor's day and seed the selection from what's already
  // published, so "publish" is an edit of the current state, not a reset.
  useEffect(() => {
    let active = true;
    void listSlotsForDoctor(currentDoctorId).then((all) => {
      if (!active) return;
      const day = all.filter((s) => s.date === today);
      setSlots(day);
      setSelected(
        new Set(day.filter((s) => s.isPublished).map((s) => s.startTime))
      );
    });
    return () => {
      active = false;
    };
  }, [currentDoctorId, today, storeState]);

  const bookedTimes = useMemo(
    () => new Set((slots ?? []).filter((s) => s.bookingId !== null).map((s) => s.startTime)),
    [slots]
  );

  /** A synthetic full-day grid: every 15-minute time, carrying the real
   * slot record where one exists so booked times stay locked. */
  const gridSlots = useMemo<AvailabilitySlot[]>(() => {
    const byTime = new Map((slots ?? []).map((s) => [s.startTime, s]));
    return DAY_TIMES.map(
      (time) =>
        byTime.get(time) ?? {
          id: `virtual-${time}`,
          doctorId: currentDoctorId,
          date: today,
          startTime: time,
          durationMinutes: 15,
          isPublished: false,
          bookingId: null,
        }
    );
  }, [slots, currentDoctorId, today]);

  const selectedIds = useMemo(
    () => new Set(gridSlots.filter((s) => selected.has(s.startTime)).map((s) => s.id)),
    [gridSlots, selected]
  );

  const toggle = useCallback(
    (slotId: string) => {
      const slot = gridSlots.find((s) => s.id === slotId);
      if (!slot || bookedTimes.has(slot.startTime)) return;
      setSelected((current) => {
        const next = new Set(current);
        if (next.has(slot.startTime)) next.delete(slot.startTime);
        else next.add(slot.startTime);
        return next;
      });
      setPublished(false);
    },
    [gridSlots, bookedTimes]
  );

  const addRange = useCallback(
    (from: string, to: string) => {
      setSelected((current) => {
        const next = new Set(current);
        for (const t of timesInRange(from, to)) {
          if (!bookedTimes.has(t)) next.add(t);
        }
        return next;
      });
      setPublished(false);
    },
    [bookedTimes]
  );

  const publish = useCallback(async () => {
    await setDayAvailability(currentDoctorId, today, [...selected]);
    setPublished(true);
  }, [currentDoctorId, today, selected]);

  const selectedCount = selected.size;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-7 sm:px-6 sm:pt-9">
      <header className="mb-5">
        <p className="text-muted-foreground text-sm">{formatHebrewDate(today)}</p>
        <h1 className="text-foreground mt-1.5 text-2xl font-extrabold sm:text-3xl">
          זמינות לשיחות משפחה
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">מתי אתה זמין היום?</p>
      </header>

      {published ? (
        <div className="border-primary/18 bg-secondary/80 animate-fade-in-up mb-5 flex items-center gap-3 rounded-xl border px-4 py-3.5">
          <span className="bg-primary animate-success-check flex size-9 shrink-0 items-center justify-center rounded-full">
            <Check className="size-5 stroke-[3] text-white" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-foreground text-sm font-bold">הזמינות פורסמה</p>
            <p className="text-muted-foreground text-sm">
              המשפחות יכולות כעת לראות את הזמנים שבחרת.
            </p>
          </div>
        </div>
      ) : null}

      <section className="border-border bg-card shadow-card rounded-xl border p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
            <CalendarClock className="text-primary size-4.5" aria-hidden />
            הזמינות שלי להיום
          </h2>
          <span className="bg-secondary text-primary rounded-full px-3 py-1 text-xs font-bold tabular-nums">
            {selectedCount} נבחרו
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {QUICK_RANGES.map((range) => (
            <Button
              key={range.label}
              variant="outline"
              size="sm"
              onClick={() => addRange(range.from, range.to)}
            >
              <Plus aria-hidden />
              <span dir="ltr" className="tabular-nums">
                {range.label}
              </span>
            </Button>
          ))}
          {selectedCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected(new Set(bookedTimes));
                setPublished(false);
              }}
            >
              נקה הכל
            </Button>
          ) : null}
        </div>

        <AvailabilityGrid slots={gridSlots} selectedIds={selectedIds} onToggle={toggle} />

        <p className="text-muted-foreground mt-4 flex items-start gap-2 text-xs leading-relaxed">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          רק השעות המסומנות יוצגו למשפחות. שעות שכבר נקבעה בהן שיחה נעולות ואי אפשר
          לבטל אותן כאן.
        </p>
      </section>

      <div className="mt-5">
        <Button
          onClick={() => void publish()}
          className="w-full sm:w-auto sm:min-w-52"
          size="lg"
        >
          פרסם זמינות
        </Button>
      </div>
    </main>
  );
}
