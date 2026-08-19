"use client";

import Link from "next/link";
import { BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Stands in for the morning email that will later ask the doctor to
 * publish availability. Appears only when nothing is published for today,
 * and disappears the moment something is — it must never nag.
 */
function ReminderBanner() {
  return (
    <div className="border-primary/18 bg-secondary/80 animate-fade-in-up mb-5 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3.5">
      <span className="bg-primary/12 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
        <BellRing className="size-4.5" aria-hidden />
      </span>
      <p className="text-foreground min-w-0 flex-1 text-sm font-semibold">
        עדיין לא פרסמת זמינות להיום
      </p>
      <Button size="sm" asChild>
        <Link href="/doctor/availability">עדכן זמינות</Link>
      </Button>
    </div>
  );
}

export { ReminderBanner };
