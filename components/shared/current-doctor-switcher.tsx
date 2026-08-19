"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { listDoctors } from "@/lib/store/api";
import { useCurrentDoctorId, useStoreState, useSwitchDoctor } from "@/lib/store/context";
import type { Doctor } from "@/types";

/**
 * Demo affordance only — stands in for real authentication so the
 * per-doctor separation can actually be demonstrated (publish as one
 * doctor, book as a family, see it appear for that doctor and no other).
 * Real auth replaces this; nothing else has to change.
 */
function CurrentDoctorSwitcher() {
  const storeState = useStoreState();
  const currentDoctorId = useCurrentDoctorId();
  const switchDoctor = useSwitchDoctor();
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    let active = true;
    void listDoctors().then((next) => {
      if (active) setDoctors(next);
    });
    return () => {
      active = false;
    };
  }, [storeState]);

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">מחובר כרופא</span>
      <select
        value={currentDoctorId}
        onChange={(e) => switchDoctor(e.target.value)}
        className={[
          "border-border bg-card text-foreground appearance-none rounded-md border",
          "min-h-10 ps-3 pe-8 text-sm font-semibold",
          "outline-none focus-visible:ring-ring focus-visible:ring-[3px]",
        ].join(" ")}
      >
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name}
          </option>
        ))}
      </select>
      <ChevronDown
        className="text-muted-foreground pointer-events-none absolute end-2.5 size-4"
        aria-hidden
      />
    </label>
  );
}

export { CurrentDoctorSwitcher };
