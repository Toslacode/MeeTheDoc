"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { store } from "./external-store";
import type { StoreState } from "./reducer";

const StoreStateContext = createContext<StoreState | null>(null);

/**
 * Makes the live store state available to the whole app via React context,
 * subscribed through useSyncExternalStore so a mutation from anywhere
 * (lib/store/api.ts) is reflected in every mounted reader — e.g. a booking
 * created in the family flow shows up in the doctor dashboard immediately,
 * with no reload and no prop drilling between the two route trees.
 *
 * Mount this once, above both /family and /doctor (see app/layout.tsx).
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getServerSnapshot
  );

  useEffect(() => {
    // Runs after the first client render, so that render still matches
    // the server-rendered HTML (no hydration mismatch) and any persisted
    // demo data from a previous visit is applied right after.
    store.hydrateFromStorage();
  }, []);

  return (
    <StoreStateContext.Provider value={state}>
      {children}
    </StoreStateContext.Provider>
  );
}

/**
 * The full live store state. Prefer a narrower selector hook where one
 * exists (e.g. `useCurrentDoctorId`) so a component only re-renders for
 * the slice of state it actually reads.
 *
 * Recommended pattern for a screen that needs to stay in sync with
 * mutations made elsewhere (e.g. the doctor dashboard reflecting a
 * booking a family just created): read this hook to subscribe to
 * changes, and re-run the relevant lib/store/api.ts call in a `useEffect`
 * keyed on it —
 *
 *   const state = useStoreState();
 *   const [bookings, setBookings] = useState<Booking[]>([]);
 *   useEffect(() => {
 *     listBookings(doctorId).then(setBookings);
 *   }, [state, doctorId]);
 *
 * That way lib/store/api.ts stays the single place the actual read/filter
 * logic (in particular the privacy invariant in `listPublishedSlots`)
 * lives, while this context is only ever used as the "something changed"
 * signal that triggers re-fetching it.
 */
export function useStoreState(): StoreState {
  const state = useContext(StoreStateContext);
  if (!state) {
    throw new Error("useStoreState must be used within a StoreProvider");
  }
  return state;
}

/**
 * The doctor currently "logged in" for demo purposes, defaulting to
 * ד"ר יעל כהן. This stands in for real auth — later, this hook's
 * implementation swaps to read an actual session, and every call site
 * that threads a doctorId through (e.g. `listSlotsForDoctor(doctorId)`)
 * stays unchanged.
 */
export function useCurrentDoctorId(): string {
  return useStoreState().currentDoctorId;
}

/** Switches the acting doctor. Intended for a small, unobtrusive demo
 * affordance (see components/shared/current-doctor-switcher.tsx) — not
 * part of any real auth flow. */
export function useSwitchDoctor(): (doctorId: string) => void {
  return (doctorId: string) => {
    store.dispatch({ type: "SWITCH_DOCTOR", doctorId });
  };
}
