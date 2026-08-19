"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const [step, setStepState] = useState<Step>("doctor");
  const [department, setDepartment] = useState<Department | null>(null);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // submittingRef mirrors `submitting`, and stepRef mirrors `step` —
  // both kept in perfect sync with their state at the exact moment each
  // changes (see setStep below), not via a useEffect. createBooking's own
  // dispatch fires synchronously and can spin up a fresh instance of the
  // slots-fetch effect below WHILE handleSubmit is still suspended on its
  // own `await`; that new instance's `.then()` callback is a plain
  // microtask that can resolve BEFORE React finishes the render + commit
  // + passive-effects cycle a reactive `useEffect(() => ref.current =
  // step, [step])` would need to catch up — a `.then()` callback reliably
  // wins that race against a whole React update cycle. Only a ref written
  // synchronously at the same call site as setStep closes the gap.
  const submittingRef = useRef(false);
  const stepRef = useRef<Step>(step);
  const setStep = useCallback((next: Step) => {
    stepRef.current = next;
    setStepState(next);
  }, []);

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

  // Selected doctor's published, unbooked slots — and, in the same pass,
  // the recovery path for a slot that vanished out from under the family.
  useEffect(() => {
    // No doctor chosen yet: nothing to fetch. Stale slots are never
    // rendered, because the slot step only shows once a doctor is set.
    if (!selectedDoctorId) return;
    let active = true;
    void listPublishedSlots(selectedDoctorId).then((next) => {
      if (!active) return;
      setSlots(next);

      // The doctor can unpublish a slot at any moment, including while the
      // family already has it selected or is mid-way through the details
      // form. This effect re-runs on every store change regardless of
      // which step is showing, so if the family's selected slot just
      // dropped out of the fresh list, recover immediately instead of
      // leaving a stale id around: without this, the render guards below
      // would fail their `selectedSlot` check and silently fall through
      // to the doctor-list screen, discarding anything typed into the
      // booking form.
      //
      // submittingRef guards against a specific false positive: OUR OWN
      // successful booking also removes the slot from this same list (it's
      // now booked, not just published-and-free), which would otherwise
      // look identical to someone else taking it and wrongly bounce a
      // successful submission back to the slot step. handleSubmit already
      // owns the outcome of its own request, success or failure.
      if (
        !submittingRef.current &&
        selectedSlotId &&
        (stepRef.current === "slot" || stepRef.current === "details") &&
        !next.some((slot) => slot.id === selectedSlotId)
      ) {
        setSelectedSlotId(null);
        setStep("slot");
        setSubmitError("הזמן שנבחר כבר אינו פנוי. נא לבחור זמן אחר.");
      }
    });
    return () => {
      active = false;
    };
  }, [selectedDoctorId, storeState, selectedSlotId, step, setStep]);

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
  }, [setStep]);

  const handleSelectSlot = useCallback((slotId: string) => {
    setSelectedSlotId((current) => (current === slotId ? null : slotId));
  }, []);

  const handleSubmit = useCallback(
    async (values: BookingFormSubmit) => {
      if (!selectedDoctorId || !selectedSlotId) return;
      submittingRef.current = true;
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
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [selectedDoctorId, selectedSlotId, setStep]
  );

  const restart = useCallback(() => {
    setBooking(null);
    setSelectedSlotId(null);
    setSelectedDoctorId(null);
    setSubmitError(null);
    setStep("doctor");
  }, [setStep]);

  if (step === "success" && booking && selectedDoctor) {
    return (
      <div key={step} className="animate-step-in">
        <FamilyShell departmentName={departmentName} title="">
          <BookingSuccess booking={booking} doctor={selectedDoctor} onDone={restart} />
        </FamilyShell>
      </div>
    );
  }

  if (step === "details" && selectedDoctor && selectedSlot) {
    return (
      <div key={step} className="animate-step-in">
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
      </div>
    );
  }

  if (step === "slot" && selectedDoctor) {
    return (
      <div key={step} className="animate-step-in">
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
      </div>
    );
  }

  return (
    <div key={step} className="animate-step-in">
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
    </div>
  );
}
