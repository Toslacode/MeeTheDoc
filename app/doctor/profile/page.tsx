"use client";

import { useEffect, useState } from "react";
import { LogOut, Mail, Stethoscope } from "lucide-react";
import Link from "next/link";

import { MeeTheDocLogo } from "@/components/brand/meethedoc-logo";
import { CurrentDoctorSwitcher } from "@/components/shared/current-doctor-switcher";
import { Button } from "@/components/ui/button";
import { doctorInitials } from "@/lib/format";
import { getDoctor, listDepartments, resetDemoData } from "@/lib/store/api";
import { useCurrentDoctorId, useStoreState } from "@/lib/store/context";
import type { Department, Doctor } from "@/types";

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
    <main className="mx-auto w-full max-w-2xl px-4 pt-7 pb-14 sm:px-6 sm:pt-9">
      <h1 className="text-foreground mb-6 text-2xl font-extrabold sm:text-3xl">פרופיל</h1>

      <section className="border-border bg-card shadow-card rounded-xl border p-5">
        <div className="flex items-center gap-4">
          <span className="bg-secondary text-primary flex size-14 items-center justify-center rounded-full text-lg font-bold">
            {doctor ? doctorInitials(doctor.name) : ""}
          </span>
          <div className="min-w-0">
            <p className="text-foreground text-lg font-bold">{doctor?.name}</p>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Stethoscope className="size-4" aria-hidden />
              {doctor?.specialty}
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">{department?.name}</p>
          </div>
        </div>
      </section>

      <section className="border-border bg-card shadow-card mt-4 rounded-xl border p-5">
        <h2 className="text-foreground text-base font-bold">הדגמה</h2>
        <p className="text-muted-foreground mt-1 mb-3.5 text-sm leading-relaxed">
          החלפת הרופא המחובר עומדת כאן במקום התחברות אמיתית, כדי שאפשר יהיה להדגים
          שכל רופא מנהל זמינות ושיחות בנפרד.
        </p>
        <CurrentDoctorSwitcher />
      </section>

      <section className="border-border bg-card shadow-card mt-4 rounded-xl border p-5">
        <h2 className="text-foreground text-base font-bold">נתוני הדגמה</h2>
        <p className="text-muted-foreground mt-1 mb-3.5 text-sm leading-relaxed">
          איפוס יחזיר את הזמינות והשיחות למצב ההתחלתי.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" onClick={() => void resetDemoData()}>
            אפס נתוני הדגמה
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">
              <LogOut className="rtl:-scale-x-100" aria-hidden />
              יציאה
            </Link>
          </Button>
        </div>
      </section>

      <div className="text-muted-foreground mt-8 flex items-center justify-center gap-2 text-xs">
        <MeeTheDocLogo size="sm" />
        <span className="flex items-center gap-1">
          <Mail className="size-3.5" aria-hidden />
          תזכורת בוקר תישלח אוטומטית כשלא פורסמה זמינות
        </span>
      </div>
    </main>
  );
}
