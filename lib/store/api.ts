import { SLOT_DURATION_MINUTES } from "@/types";
import type {
  AvailabilitySlot,
  Booking,
  BookingStatus,
  Department,
  Doctor,
  MeetingType,
  Topic,
} from "@/types";

import { validateEmail, validatePhone } from "@/lib/validation";

import { store } from "./external-store";
import { createId } from "./id";

/**
 * ── THE API SEAM ────────────────────────────────────────────────────────
 * This module is the ONLY way UI code reads or writes application data.
 * No component may import lib/mock-data.ts or lib/store/external-store.ts
 * directly (enforced by the no-restricted-imports rule in
 * eslint.config.mjs, scoped to everything outside lib/store/**).
 *
 * Every export here is async and returns a Promise, even though today's
 * implementation is synchronous in-memory/localStorage mock data. That's
 * deliberate: swapping this file's internals for real network calls (e.g.
 * Supabase) later means editing only this file — no call site, anywhere
 * in the app, has to change.
 * ───────────────────────────────────────────────────────────────────────
 */

function toAsync<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

export async function listDepartments(): Promise<Department[]> {
  return toAsync(store.getState().departments.map((d) => ({ ...d })));
}

export async function listDoctors(): Promise<Doctor[]> {
  return toAsync(store.getState().doctors.map((d) => ({ ...d })));
}

export async function getDoctor(doctorId: string): Promise<Doctor | null> {
  const doctor = store.getState().doctors.find((d) => d.id === doctorId);
  return toAsync(doctor ? { ...doctor } : null);
}

/**
 * FAMILY-FACING READ — THE PRIVACY INVARIANT.
 *
 * A slot is returned here if and only if it (a) belongs to `doctorId`,
 * (b) has been explicitly published, and (c) is not booked. That's the
 * entire rule, and it lives only here: there is no un-scoped "all slots"
 * export from this module, so a family call site structurally cannot see
 * another doctor's calendar, an unpublished slot, a slot someone else
 * already booked, or any other booking's details — there is no function
 * that would hand any of that back to it.
 */
export async function listPublishedSlots(doctorId: string): Promise<AvailabilitySlot[]> {
  const visible = store
    .getState()
    .slots.filter(
      (slot) => slot.doctorId === doctorId && slot.isPublished && slot.bookingId === null
    )
    .map((slot) => ({ ...slot }));
  return toAsync(visible);
}

/**
 * DOCTOR-FACING READ. Returns every slot belonging to one doctor,
 * regardless of publish/booked state, for that doctor's own availability
 * management screen. Callers must only ever pass the acting/authenticated
 * doctor's own id (see `useCurrentDoctorId` in lib/store/context.tsx) —
 * this function does not itself restrict the caller to "your own" slots,
 * the same way a real per-doctor-scoped backend endpoint wouldn't either.
 */
export async function listSlotsForDoctor(doctorId: string): Promise<AvailabilitySlot[]> {
  const slots = store
    .getState()
    .slots.filter((slot) => slot.doctorId === doctorId)
    .map((slot) => ({ ...slot }));
  return toAsync(slots);
}

export async function publishAvailability(
  doctorId: string,
  slotIds: string[]
): Promise<AvailabilitySlot[]> {
  store.dispatch({ type: "PUBLISH_SLOTS", doctorId, slotIds });
  return listSlotsForDoctor(doctorId);
}

export async function unpublishAvailability(
  doctorId: string,
  slotIds: string[]
): Promise<AvailabilitySlot[]> {
  store.dispatch({ type: "UNPUBLISH_SLOTS", doctorId, slotIds });
  return listSlotsForDoctor(doctorId);
}

/**
 * Publishes exactly `times` as this doctor's availability for `date`, and
 * un-publishes everything else free on that day. Slot records are created
 * on demand, so the doctor can offer any 15-minute time rather than only
 * times that happen to exist in the seed.
 *
 * Already-booked times are preserved untouched and are not re-created.
 */
export async function setDayAvailability(
  doctorId: string,
  date: string,
  times: string[]
): Promise<AvailabilitySlot[]> {
  const state = store.getState();
  const sameDay = state.slots.filter((s) => s.doctorId === doctorId && s.date === date);
  const bookedTimes = new Set(
    sameDay.filter((s) => s.bookingId !== null).map((s) => s.startTime)
  );
  const existingByTime = new Map(sameDay.map((s) => [s.startTime, s]));

  const slots: AvailabilitySlot[] = times
    .filter((time) => !bookedTimes.has(time))
    .map((time) => {
      const existing = existingByTime.get(time);
      if (existing) return { ...existing, isPublished: true };
      return {
        id: createId("slot"),
        doctorId,
        date,
        startTime: time,
        durationMinutes: SLOT_DURATION_MINUTES,
        isPublished: true,
        bookingId: null,
      };
    });

  store.dispatch({ type: "REPLACE_DAY_SLOTS", doctorId, date, slots });
  return listSlotsForDoctor(doctorId);
}

export interface CreateBookingInput {
  doctorId: string;
  slotId: string;
  patientName: string;
  familyContactName: string;
  email: string;
  phone: string;
  meetingType: MeetingType;
  topic: Topic;
  notes?: string;
}

/**
 * Books a slot on behalf of a family. Guards the same invariant
 * `listPublishedSlots` enforces on read: the slot must belong to
 * `doctorId`, be published, and still be free, or this rejects instead of
 * silently double-booking or booking across doctors. These are defensive,
 * programmer-facing checks (Error, in English) — user-facing field
 * validation with Hebrew messages happens before this is called, via
 * lib/validation.ts.
 */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const state = store.getState();
  const slot = state.slots.find((s) => s.id === input.slotId);

  if (!slot || slot.doctorId !== input.doctorId) {
    throw new Error(`Slot "${input.slotId}" does not belong to doctor "${input.doctorId}"`);
  }
  if (!slot.isPublished || slot.bookingId !== null) {
    throw new Error(`Slot "${input.slotId}" is not currently available for booking`);
  }
  if (!input.patientName.trim() || !input.familyContactName.trim()) {
    throw new Error("Missing required booking fields");
  }
  // Same shape rules the form itself enforces (lib/validation.ts) — kept
  // here too so this being the only sanctioned write surface actually
  // means something: a future caller that skips form validation still
  // can't write a malformed phone/email into a booking.
  if (validatePhone(input.phone)) {
    throw new Error(`Invalid phone number: "${input.phone}"`);
  }
  if (validateEmail(input.email)) {
    throw new Error(`Invalid email address: "${input.email}"`);
  }

  const booking: Booking = {
    id: createId("booking"),
    doctorId: input.doctorId,
    slotId: input.slotId,
    date: slot.date,
    startTime: slot.startTime,
    patientName: input.patientName.trim(),
    familyContactName: input.familyContactName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    meetingType: input.meetingType,
    topic: input.topic,
    notes: input.notes?.trim() || undefined,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  };

  store.dispatch({ type: "CREATE_BOOKING", booking });
  return toAsync({ ...booking });
}

/**
 * Sets (or, with `null`, clears) the doctor's profile picture. Callers are
 * responsible for downscaling first — see
 * components/doctor/avatar-picker.tsx.
 */
export async function setDoctorAvatar(
  doctorId: string,
  avatarDataUrl: string | null
): Promise<Doctor | null> {
  store.dispatch({ type: "SET_DOCTOR_AVATAR", doctorId, avatarDataUrl });
  return getDoctor(doctorId);
}

export interface BookingFilter {
  date?: string;
  status?: BookingStatus;
}

export async function listBookings(
  doctorId: string,
  filter: BookingFilter = {}
): Promise<Booking[]> {
  const bookings = store
    .getState()
    .bookings.filter((booking) => booking.doctorId === doctorId)
    .filter((booking) => (filter.date ? booking.date === filter.date : true))
    .filter((booking) => (filter.status ? booking.status === filter.status : true))
    .map((booking) => ({ ...booking }));
  return toAsync(bookings);
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<Booking> {
  store.dispatch({ type: "UPDATE_BOOKING_STATUS", bookingId, status });
  const updated = store.getState().bookings.find((b) => b.id === bookingId);
  if (!updated) {
    throw new Error(`Booking "${bookingId}" not found`);
  }
  return toAsync({ ...updated });
}

/** Wipes localStorage and in-memory state back to the seed data. Exposed
 * so a "reset demo data" affordance can be wired up wherever it's wanted
 * (see components/shared/reset-demo-data-button.tsx). */
export async function resetDemoData(): Promise<void> {
  store.reset();
  return toAsync(undefined);
}
