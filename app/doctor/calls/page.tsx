"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck2, Clock3, MessagesSquare } from "lucide-react";

import { CallCard } from "@/components/doctor/call-card";
import { CallDetailsDialog } from "@/components/doctor/call-details-dialog";
import { ReminderBanner } from "@/components/doctor/reminder-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHebrewDate, todayIso } from "@/lib/format";
import {
  getDoctor,
  listBookings,
  listSlotsForDoctor,
  updateBookingStatus,
} from "@/lib/store/api";
import { useCurrentDoctorId, useStoreState } from "@/lib/store/context";
import { useSlidingIndicator } from "@/lib/use-sliding-indicator";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus, Doctor } from "@/types";

type Tab = "today" | "upcoming" | "completed";

const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "היום" },
  { id: "upcoming", label: "קרובות" },
  { id: "completed", label: "הושלמו" },
];

export default function DoctorCallsPage() {
  const storeState = useStoreState();
  const currentDoctorId = useCurrentDoctorId();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [hasPublishedToday, setHasPublishedToday] = useState(true);
  const [tab, setTab] = useState<Tab>("today");
  const [openBookingId, setOpenBookingId] = useState<string | null>(null);

  const today = todayIso();

  useEffect(() => {
    let active = true;
    async function load() {
      const [d, all, slots] = await Promise.all([
        getDoctor(currentDoctorId),
        listBookings(currentDoctorId),
        listSlotsForDoctor(currentDoctorId),
      ]);
      if (!active) return;
      setDoctor(d);
      setBookings(all);
      setHasPublishedToday(
        slots.some((slot) => slot.date === today && slot.isPublished)
      );
    }
    void load();
    return () => {
      active = false;
    };
  }, [currentDoctorId, storeState, today]);

  const visible = useMemo(() => {
    if (!bookings) return [];
    const sorted = [...bookings].sort(
      (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    );
    if (tab === "today") {
      return sorted.filter((b) => b.date === today && b.status === "scheduled");
    }
    if (tab === "upcoming") {
      return sorted.filter((b) => b.date > today && b.status === "scheduled");
    }
    return sorted.filter((b) => b.status !== "scheduled");
  }, [bookings, tab, today]);

  const todayAll = useMemo(
    () => bookings?.filter((b) => b.date === today) ?? [],
    [bookings, today]
  );
  const todayScheduled = useMemo(
    () => todayAll.filter((b) => b.status === "scheduled"),
    [todayAll]
  );
  const todayDone = useMemo(
    () => todayAll.filter((b) => b.status === "completed"),
    [todayAll]
  );

  const openBooking = useMemo(
    () => bookings?.find((b) => b.id === openBookingId) ?? null,
    [bookings, openBookingId]
  );

  const handleStatusChange = useCallback(
    (bookingId: string, status: BookingStatus) => {
      void updateBookingStatus(bookingId, status).then(() => setOpenBookingId(null));
    },
    []
  );

  const { indicatorRect, registerItem } = useSlidingIndicator(tab);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-7 sm:px-6 sm:pt-9">
      <header className="mb-6">
        <p className="text-muted-foreground text-sm">{formatHebrewDate(today)}</p>
        <h1 className="text-foreground mt-1.5 text-2xl font-extrabold sm:text-3xl">
          השיחות שלי
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {doctor?.name}
          {todayScheduled.length > 0
            ? ` · ${todayScheduled.length} שיחות היום`
            : " · אין שיחות מתוכננות היום"}
        </p>
      </header>

      {!hasPublishedToday ? <ReminderBanner /> : null}

      <div className="border-border bg-card shadow-card mb-4 grid grid-cols-3 rounded-xl border [&>*+*]:border-s [&>*+*]:border-border">
        <SummaryTile label="סה״כ היום" value={todayAll.length} icon={MessagesSquare} />
        <SummaryTile label="הושלמו" value={todayDone.length} icon={CalendarCheck2} />
        <SummaryTile label="נותרו" value={todayScheduled.length} icon={Clock3} />
      </div>

      <div
        role="tablist"
        aria-label="סינון שיחות"
        className="border-border bg-card relative mb-5 grid grid-cols-3 gap-1 rounded-lg border p-1"
      >
        {indicatorRect ? (
          <span
            aria-hidden
            className="glass-surface border border-[color:var(--glass-border)] bg-secondary/80 pointer-events-none absolute top-1 bottom-1 rounded-md transition-[inset-inline-start,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              insetInlineStart: indicatorRect.insetInlineStart,
              width: indicatorRect.width,
            }}
          />
        ) : null}

        {TABS.map((t) => (
          <button
            key={t.id}
            ref={registerItem(t.id)}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative min-h-10 rounded-md text-sm font-semibold",
              "transition-[color,transform] duration-150 ease-out",
              "active:scale-[0.97]",
              "outline-none focus-visible:ring-ring focus-visible:ring-[3px]",
              tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {bookings === null ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="border-border bg-card shadow-card animate-fade-in-up rounded-xl border p-8 text-center">
          <span className="bg-secondary text-primary mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
            <MessagesSquare className="size-6.5" aria-hidden />
          </span>
          <p className="text-foreground text-lg font-bold">
            {tab === "completed" ? "אין שיחות שהושלמו" : "אין שיחות מתוכננות"}
          </p>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-sm leading-relaxed">
            {tab === "completed"
              ? "שיחות שתסמן כבוצעו או כלא נענו יופיעו כאן."
              : "כשמשפחה תקבע שיחה באחד הזמנים שפרסמת, היא תופיע כאן."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((booking, index) => (
            <CallCard
              key={booking.id}
              booking={booking}
              index={index}
              onOpen={() => setOpenBookingId(booking.id)}
            />
          ))}
        </div>
      )}

      <CallDetailsDialog
        booking={openBooking}
        onClose={() => setOpenBookingId(null)}
        onStatusChange={handleStatusChange}
      />
    </main>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof MessagesSquare;
}) {
  return (
    <div className="px-4 py-4">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </span>
      <span className="text-foreground mt-1.5 block text-2xl font-extrabold tabular-nums">
        {value}
      </span>
    </div>
  );
}
