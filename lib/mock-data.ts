import { SLOT_DURATION_MINUTES } from "@/types";
import type { AvailabilitySlot, Booking, Department, Doctor } from "@/types";

import type { StoreState } from "./store/reducer";

/**
 * Seed data for the mock backend. This file is PRIVATE to the store layer
 * (lib/store/**) — it is not, and must not become, an import any UI
 * component reaches for directly. lib/store/api.ts is the only supported
 * way to read or write this data; components/pages call that instead. This
 * boundary is enforced by an eslint no-restricted-imports rule in
 * eslint.config.mjs, not just by convention.
 */

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

// Computed once per module instantiation (separately for the server and
// for each browser tab — see lib/store/external-store.ts for why that's
// safe). "Today" so the doctor dashboard is never empty on first load.
function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

interface SeedSlotOptions {
  published: boolean;
  bookingId?: string | null;
}

function makeSlot(
  id: string,
  doctorId: string,
  date: string,
  startTime: string,
  options: SeedSlotOptions
): AvailabilitySlot {
  return {
    id,
    doctorId,
    date,
    startTime,
    durationMinutes: SLOT_DURATION_MINUTES,
    isPublished: options.published,
    bookingId: options.bookingId ?? null,
  };
}

const DEPARTMENTS: Department[] = [{ id: "dept-internal-b", name: "מחלקה פנימית ב׳" }];

const DOCTORS: Doctor[] = [
  {
    id: "doc-yael-cohen",
    name: 'ד"ר יעל כהן',
    specialty: "רפואה פנימית",
    departmentId: "dept-internal-b",
  },
  {
    id: "doc-itai-levi",
    name: 'ד"ר איתי לוי',
    specialty: "רפואה פנימית",
    departmentId: "dept-internal-b",
  },
  {
    id: "doc-maya-rosen",
    name: 'ד"ר מאיה רוזן',
    specialty: "רפואה פנימית",
    departmentId: "dept-internal-b",
  },
];

/**
 * Builds a fresh, independent copy of the seed state every time it's
 * called (server snapshot, first client state, and every demo reset all
 * get their own object graph — see lib/store/external-store.ts).
 *
 * Per-doctor isolation is deliberate here, not incidental: each doctor
 * gets a DIFFERENT set of published/unpublished slot times and their OWN
 * booking, so a regression that leaks slots or bookings across doctors
 * shows up immediately (see tests/store-api.test.ts).
 */
export function createInitialState(): StoreState {
  const today = todayIso();

  const slots: AvailabilitySlot[] = [
    // ד"ר יעל כהן — the default acting doctor.
    makeSlot("slot-yael-0900", "doc-yael-cohen", today, "09:00", { published: true }),
    makeSlot("slot-yael-0915", "doc-yael-cohen", today, "09:15", { published: true }),
    makeSlot("slot-yael-0930", "doc-yael-cohen", today, "09:30", { published: true }),
    makeSlot("slot-yael-0945", "doc-yael-cohen", today, "09:45", {
      published: true,
      bookingId: "booking-yael-1",
    }),
    makeSlot("slot-yael-1000", "doc-yael-cohen", today, "10:00", { published: true }),
    makeSlot("slot-yael-1015", "doc-yael-cohen", today, "10:15", { published: true }),
    makeSlot("slot-yael-1100", "doc-yael-cohen", today, "11:00", { published: true }),
    makeSlot("slot-yael-1130", "doc-yael-cohen", today, "11:30", { published: true }),
    makeSlot("slot-yael-1200", "doc-yael-cohen", today, "12:00", { published: false }),
    makeSlot("slot-yael-1215", "doc-yael-cohen", today, "12:15", { published: false }),

    // ד"ר איתי לוי — different times from every other doctor.
    makeSlot("slot-itai-1300", "doc-itai-levi", today, "13:00", { published: true }),
    makeSlot("slot-itai-1315", "doc-itai-levi", today, "13:15", { published: true }),
    makeSlot("slot-itai-1400", "doc-itai-levi", today, "14:00", {
      published: true,
      bookingId: "booking-itai-1",
    }),
    makeSlot("slot-itai-1415", "doc-itai-levi", today, "14:15", { published: true }),
    makeSlot("slot-itai-1430", "doc-itai-levi", today, "14:30", { published: true }),
    makeSlot("slot-itai-1445", "doc-itai-levi", today, "14:45", { published: true }),
    makeSlot("slot-itai-1500", "doc-itai-levi", today, "15:00", { published: false }),
    makeSlot("slot-itai-1515", "doc-itai-levi", today, "15:15", { published: false }),

    // ד"ר מאיה רוזן — again, different times from either doctor above.
    makeSlot("slot-maya-0800", "doc-maya-rosen", today, "08:00", { published: true }),
    makeSlot("slot-maya-0815", "doc-maya-rosen", today, "08:15", { published: true }),
    makeSlot("slot-maya-0830", "doc-maya-rosen", today, "08:30", {
      published: true,
      bookingId: "booking-maya-1",
    }),
    makeSlot("slot-maya-0845", "doc-maya-rosen", today, "08:45", { published: true }),
    makeSlot("slot-maya-0915", "doc-maya-rosen", today, "09:15", { published: true }),
    makeSlot("slot-maya-0945", "doc-maya-rosen", today, "09:45", { published: true }),
    makeSlot("slot-maya-1000", "doc-maya-rosen", today, "10:00", { published: false }),
    makeSlot("slot-maya-1015", "doc-maya-rosen", today, "10:15", { published: false }),
  ];

  const bookings: Booking[] = [
    {
      id: "booking-yael-1",
      doctorId: "doc-yael-cohen",
      slotId: "slot-yael-0945",
      date: today,
      startTime: "09:45",
      patientName: "משה כהן",
      familyContactName: "דנה כהן",
      email: "dana.cohen@example.com",
      phone: "0521234567",
      meetingType: "google_meet",
      topic: "treatment_plan",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    },
    {
      id: "booking-itai-1",
      doctorId: "doc-itai-levi",
      slotId: "slot-itai-1400",
      date: today,
      startTime: "14:00",
      patientName: "שרה לוי",
      familyContactName: "יוסי לוי",
      email: "yossi.levi@example.com",
      phone: "0537654321",
      meetingType: "phone",
      topic: "test_results",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    },
    {
      id: "booking-maya-1",
      doctorId: "doc-maya-rosen",
      slotId: "slot-maya-0830",
      date: today,
      startTime: "08:30",
      patientName: "רחל אברהם",
      familyContactName: "נעם אברהם",
      email: "noam.avraham@example.com",
      phone: "0549876543",
      meetingType: "in_person",
      topic: "condition",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    departments: DEPARTMENTS.map((department) => ({ ...department })),
    doctors: DOCTORS.map((doctor) => ({ ...doctor })),
    slots,
    bookings,
    currentDoctorId: DOCTORS[0].id,
  };
}
