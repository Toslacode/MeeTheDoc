"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, LogOut, RotateCcw } from "lucide-react";

import { AvatarPicker } from "@/components/doctor/avatar-picker";
import { CurrentDoctorSwitcher } from "@/components/shared/current-doctor-switcher";
import { getDoctor, listDepartments, resetDemoData } from "@/lib/store/api";
import { useCurrentDoctorId, useStoreState } from "@/lib/store/context";
import type { Department, Doctor } from "@/types";

/**
 * Deliberately not a stack of white panels. The identity block sits
 * directly on the page ground — it is the subject, so boxing it adds a
 * border that communicates nothing — and everything actionable is grouped
 * into ONE divided list. Elevation is reserved for things that are
 * genuinely a layer above the page.
 */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 px-4">
      <span className="text-foreground text-sm font-semibold">{label}</span>
      {children}
    </div>
  );
}

export default function DoctorProfilePage() {
  const storeState = useStoreState();
  const currentDoctorId = useCurrentDoctorId();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([getDoctor(currentDoctorId), listDepartments()]).then(
      ([d, departments]) => {
        if (!active) return;
        setDoctor(d);
        setDepartment(departments[0] ?? null);
      }
    );
    return () => {
      active = false;
    };
  }, [currentDoctorId, storeState]);

  return (
    <main className="mx-auto w-full max-w-lg px-4 pt-8 sm:px-6 sm:pt-12">
      <section className="flex flex-col items-center text-center">
        <AvatarPicker doctor={doctor} />

        <h1 className="text-foreground mt-4 text-2xl font-extrabold tracking-tight">
          {doctor?.name ?? " "}
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {doctor?.specialty}
          {department ? ` · ${department.name}` : ""}
        </p>
      </section>

      <div className="border-border bg-card divide-border mt-9 divide-y rounded-xl border">
        <Row label="מחובר כ">
          <CurrentDoctorSwitcher />
        </Row>

        <Row label="נתוני הדגמה">
          <button
            type="button"
            onClick={() => void resetDemoData()}
            className="text-primary hover:bg-secondary inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-ring focus-visible:ring-[3px]"
          >
            <RotateCcw className="size-4" aria-hidden />
            איפוס
          </button>
        </Row>

        <Link
          href="/"
          className="hover:bg-secondary/50 flex min-h-14 items-center justify-between gap-4 px-4 transition-colors outline-none focus-visible:ring-ring focus-visible:ring-[3px]"
        >
          <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <LogOut className="text-muted-foreground size-4 rtl:-scale-x-100" aria-hidden />
            יציאה
          </span>
          <ChevronLeft className="text-muted-foreground/60 size-4" aria-hidden />
        </Link>
      </div>
    </main>
  );
}
