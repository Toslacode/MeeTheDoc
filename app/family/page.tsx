"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import { BookingForm, type BookingFormSubmit } from "@/components/family/booking-form";
import { BookingSuccess } from "@/components/family/booking-success";
import { DoctorCard } from "@/components/family/doctor-card";
import { FamilyShell } from "@/components/family/family-shell";
import { SlotPicker } from "@/components/family/slot-picker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createBooking,
  listDepartments,
  listDoctors,
  listPublishedSlots,
} from "@/lib/store/api";
import { useStoreState } from "@/lib/store/context";
import type { AvailabilitySlot, Booking, Department, Doctor } from "@/types";

type Step = "doctor" | "slot" | "details" | "success";

/**
 * The whole family journey lives on one route with internal step state
 * rather than four nested routes. The flow is meant to take 30-60 seconds
 * from an emailed link; full page navigations between every step would add
 * latency and lose the picked slot on a stray back-press.
 *
 * Confirmation is folded into the details step as a summary card above the
 * CTA (doctor / date / time stay visible while filling the form) instead of
 * being its own screen — a separate confirm step is pure friction here.
 */
export default function FamilyPage() {
  // Subscribed purely as a "something changed" signal — e.g. the doctor
  // publishes new availability while the family has the page open. The
  // actual filtering stays in lib/store/api.ts.
  const storeState = useStoreState();

  const [step, setStep] = useState<Step>("doctor");
  const [department, setDepartment] = useState<Department | null>(null);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Doctor list + per-doctor available counts.
  useEffect(() => {
    let active = true;
    async function load() {
      const [departments, docs] = await Promise.all([listDepartments(), listDoctors()]);
      if (!active) return;
      setDepartment(departments[0] ?? null);
      setDoctors(docs);

      const counts = await Promise.all(
        docs.map(async (doctor) => {
          const published = await listPublishedSlots(doctor.id);
          return [doctor.id, published.length] as const;
        })
      );
      if (!active) return;
      setSlotCounts(Object.fromEntries(counts));
    }
    void load();
    return () => {
      active = false;
    };
  }, [storeState]);

  // Selected doctor's published, unbooked slots.
  useEffect(() => {
    // No doctor chosen yet: nothing to fetch. Stale slots are never
    // rendered, because the slot step only shows once a doctor is set.
    if (!selectedDoctorId) return;
    let active = true;
    void listPublishedSlots(selectedDoctorId).then((next) => {
      if (active) setSlots(next);
    });
    return () => {
      active = false;
    };
  }, [selectedDoctorId, storeState]);

  const selectedDoctor = useMemo(
    () => doctors?.find((d) => d.id === selectedDoctorId) ?? null,
    [doctors, selectedDoctorId]
  );
  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedSlotId) ?? null,
    [slots, selectedSlotId]
  );

  const departmentName = department?.name ?? "";

  const handleSelectDoctor = useCallback((doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedSlotId(null);
    setStep("slot");
  }, []);

  const handleSelectSlot = useCallback((slotId: string) => {
    setSelectedSlotId((current) => (current === slotId ? null : slotId));
  }, []);

  const handleSubmit = useCallback(
    async (values: BookingFormSubmit) => {
      if (!selectedDoctorId || !selectedSlotId) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        const created = await createBooking({
          doctorId: selectedDoctorId,
          slotId: selectedSlotId,
          ...values,
        });
        setBooking(created);
        setStep("success");
      } catch {
        // Most likely the slot was taken while the form was open.
        setSubmitError("הזמן שנבחר כבר אינו פנוי. נא לבחור זמן אחר.");
        setStep("slot");
        setSelectedSlotId(null);
      } finally {
        setSubmitting(false);
      }
    },
    [selectedDoctorId, selectedSlotId]
  );

  const restart = useCallback(() => {
    setBooking(null);
    setSelectedSlotId(null);
    setSelectedDoctorId(null);
    setSubmitError(null);
    setStep("doctor");
  }, []);

  if (step === "success" && booking && selectedDoctor) {
    return (
      <FamilyShell departmentName={departmentName} title="" >
        <BookingSuccess booking={booking} doctor={selectedDoctor} onDone={restart} />
      </FamilyShell>
    );
  }

  if (step === "details" && selectedDoctor && selectedSlot) {
    return (
      <FamilyShell
        departmentName={departmentName}
        title="עוד כמה פרטים"
        subtitle="הפרטים עוזרים לרופא להתכונן לשיחה מראש."
      >
        <BookingForm
          doctor={selectedDoctor}
          date={selectedSlot.date}
          time={selectedSlot.startTime}
          submitting={submitting}
          onBack={() => setStep("slot")}
          onSubmit={handleSubmit}
        />
      </FamilyShell>
    );
  }

  if (step === "slot" && selectedDoctor) {
    return (
      <FamilyShell
        departmentName={departmentName}
        title="מתי נוח לכם לדבר?"
        subtitle="מוצגים רק הזמנים שהרופא הגדיר כפנויים"
      >
        <p className="text-foreground mb-4 text-center text-base font-bold">
          {selectedDoctor.name}
        </p>

        {submitError ? (
          <p
            role="alert"
            className="border-destructive/25 bg-destructive/8 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm font-medium"
          >
            {submitError}
          </p>
        ) : null}

        <SlotPicker
          slots={slots}
          selectedSlotId={selectedSlotId}
          onSelect={handleSelectSlot}
        />

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedDoctorId(null);
              setStep("doctor");
            }}
          >
            <ChevronRight className="rtl:-scale-x-100" aria-hidden />
            חזרה לבחירת רופא
          </Button>

          <Button
            disabled={!selectedSlotId}
            onClick={() => setStep("details")}
            className="sm:min-w-44"
          >
            המשך
          </Button>
        </div>
      </FamilyShell>
    );
  }

  return (
    <FamilyShell
      departmentName={departmentName}
      title="קביעת שיחה עם רופא המחלקה"
      subtitle="בחרו את הרופא שאיתו תרצו לקבוע שיחה"
    >
      <div className="flex flex-col gap-3">
        {doctors === null
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          : doctors.map((doctor, index) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                availableCount={slotCounts[doctor.id] ?? 0}
                onSelect={() => handleSelectDoctor(doctor.id)}
                index={index}
              />
            ))}
      </div>
    </FamilyShell>
  );
}
