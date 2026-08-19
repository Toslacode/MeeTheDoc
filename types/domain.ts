/**
 * Shared domain types for MeeTheDoc. Hebrew display labels for the enums
 * below live separately in types/labels.ts — keep them out of this file so
 * the types stay presentation-agnostic.
 */

/** All availability slots are fixed-length units of this many minutes. */
export const SLOT_DURATION_MINUTES = 15;

export type MeetingType = "google_meet" | "phone" | "in_person";

export type BookingStatus = "scheduled" | "completed" | "cancelled" | "no_answer";

export type Topic =
  | "condition"
  | "test_results"
  | "treatment_plan"
  | "discharge"
  | "change"
  | "other";

export interface Department {
  id: string;
  /** Hebrew display name, e.g. "מחלקה פנימית ב׳". Department names are data
   * (there's no fixed enum of departments), not a labeled enum. */
  name: string;
}

export interface Doctor {
  id: string;
  /** Hebrew display name, e.g. "ד\"ר יעל כהן". */
  name: string;
  /** Hebrew specialty label, e.g. "רפואה פנימית". */
  specialty: string;
  departmentId: string;
}

/**
 * A single 15-minute slot on one doctor's calendar.
 *
 * State is modeled with two independent, single-source-of-truth fields
 * instead of a derived `status` enum, so "published" and "booked" can
 * never silently disagree with each other:
 *   - `isPublished`: the doctor has explicitly made this slot visible to
 *     families. Unpublished slots are never shown outside the doctor's own
 *     view, regardless of whether they're free or booked.
 *   - `bookingId`: `null` means free; any other value is the id of the
 *     booking occupying it. A slot is "booked" iff this is non-null.
 *
 * A slot is bookable by a family if and only if `isPublished && bookingId
 * === null` — see lib/store/api.ts `listPublishedSlots`, which is the only
 * place that rule is allowed to live.
 */
export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  /** ISO date, e.g. "2026-08-19". */
  date: string;
  /** 24h "HH:mm", 15-minute-aligned, e.g. "13:30". */
  startTime: string;
  durationMinutes: typeof SLOT_DURATION_MINUTES;
  isPublished: boolean;
  bookingId: string | null;
}

export interface Booking {
  id: string;
  doctorId: string;
  slotId: string;
  /** Denormalized from the slot at booking time for easy display/sorting. */
  date: string;
  startTime: string;
  patientName: string;
  /** Name of the family member making/attending the call. */
  familyContactName: string;
  email: string;
  phone: string;
  meetingType: MeetingType;
  topic: Topic;
  notes?: string;
  status: BookingStatus;
  /** ISO datetime the booking was created. */
  createdAt: string;
}
