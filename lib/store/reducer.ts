import type {
  AvailabilitySlot,
  Booking,
  BookingStatus,
  Department,
  Doctor,
} from "@/types";

export interface StoreState {
  departments: Department[];
  doctors: Doctor[];
  slots: AvailabilitySlot[];
  bookings: Booking[];
  /**
   * Simulated "who is acting as the doctor" session — see
   * lib/store/context.tsx `useCurrentDoctorId` / `useSwitchDoctor`. Real
   * auth can replace this field (and the SWITCH_DOCTOR action) without any
   * other part of the reducer changing.
   */
  currentDoctorId: string;
}

export type StoreAction =
  | { type: "HYDRATE"; state: StoreState }
  | { type: "RESET"; state: StoreState }
  | { type: "PUBLISH_SLOTS"; doctorId: string; slotIds: string[] }
  | {
      /**
       * Replaces one doctor's slots for one day with exactly `slots`.
       * Booked slots are never touched — a family that already holds a
       * booking can't have it dropped by the doctor re-publishing the day.
       * lib/store/api.ts builds the replacement list (including ids), so
       * the reducer stays free of id generation and clock reads.
       */
      type: "REPLACE_DAY_SLOTS";
      doctorId: string;
      date: string;
      slots: AvailabilitySlot[];
    }
  | { type: "UNPUBLISH_SLOTS"; doctorId: string; slotIds: string[] }
  | { type: "CREATE_BOOKING"; booking: Booking }
  | { type: "UPDATE_BOOKING_STATUS"; bookingId: string; status: BookingStatus }
  | { type: "SWITCH_DOCTOR"; doctorId: string };

export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "HYDRATE":
    case "RESET":
      return action.state;

    case "PUBLISH_SLOTS":
      return {
        ...state,
        slots: state.slots.map((slot) =>
          slot.doctorId === action.doctorId && action.slotIds.includes(slot.id)
            ? { ...slot, isPublished: true }
            : slot
        ),
      };

    case "UNPUBLISH_SLOTS":
      return {
        ...state,
        slots: state.slots.map((slot) =>
          // A booked slot can't be silently un-published out from under a
          // family who already booked it — retract the booking first.
          slot.doctorId === action.doctorId &&
          action.slotIds.includes(slot.id) &&
          slot.bookingId === null
            ? { ...slot, isPublished: false }
            : slot
        ),
      };

    case "REPLACE_DAY_SLOTS": {
      const untouched = state.slots.filter(
        (slot) =>
          slot.doctorId !== action.doctorId ||
          slot.date !== action.date ||
          slot.bookingId !== null
      );
      return { ...state, slots: [...untouched, ...action.slots] };
    }

    case "CREATE_BOOKING":
      return {
        ...state,
        bookings: [...state.bookings, action.booking],
        slots: state.slots.map((slot) =>
          slot.id === action.booking.slotId
            ? { ...slot, bookingId: action.booking.id }
            : slot
        ),
      };

    case "UPDATE_BOOKING_STATUS":
      return {
        ...state,
        bookings: state.bookings.map((booking) =>
          booking.id === action.bookingId
            ? { ...booking, status: action.status }
            : booking
        ),
      };

    case "SWITCH_DOCTOR":
      return { ...state, currentDoctorId: action.doctorId };

    default:
      return state;
  }
}
