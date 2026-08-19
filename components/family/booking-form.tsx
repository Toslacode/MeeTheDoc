"use client";

import { useState } from "react";
import {
  Building2,
  Loader2,
  MessageSquareText,
  Phone,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionCard } from "@/components/ui/option-card";
import { Textarea } from "@/components/ui/textarea";
import { BookingSummary } from "@/components/family/booking-summary";
import { TOPIC_LABELS } from "@/types";
import type { Doctor, MeetingType, Topic } from "@/types";
import { hasErrors, validateBookingForm, type FieldErrors } from "@/lib/validation";

const MEETING_TYPES: { value: MeetingType; label: string; icon: typeof Video }[] = [
  { value: "google_meet", label: "Google Meet", icon: Video },
  { value: "phone", label: "טלפון", icon: Phone },
  { value: "in_person", label: "פנים אל פנים", icon: Building2 },
];

const TOPICS: Topic[] = [
  "condition",
  "test_results",
  "treatment_plan",
  "discharge",
  "change",
  "other",
];

export interface BookingFormSubmit {
  patientName: string;
  familyContactName: string;
  phone: string;
  email: string;
  meetingType: MeetingType;
  topic: Topic;
  notes?: string;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-destructive mt-1.5 block text-sm">
      {message}
    </span>
  );
}

function BookingForm({
  doctor,
  date,
  time,
  submitting,
  onBack,
  onSubmit,
}: {
  doctor: Doctor;
  date: string;
  time: string;
  submitting: boolean;
  onBack: () => void;
  onSubmit: (values: BookingFormSubmit) => void;
}) {
  const [patientName, setPatientName] = useState("");
  const [familyContactName, setFamilyContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("google_meet");
  const [topic, setTopic] = useState<Topic>("condition");
  const [notes, setNotes] = useState("");
  // Errors appear only after a submit attempt — flagging fields red while
  // someone is still typing their first character is hostile.
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validateBookingForm({ patientName, familyContactName, phone, email });
    setErrors(found);
    if (hasErrors(found)) {
      const firstInvalid = document.querySelector<HTMLElement>("[aria-invalid='true']");
      firstInvalid?.focus();
      return;
    }
    onSubmit({
      patientName,
      familyContactName,
      phone,
      email,
      meetingType,
      topic,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <BookingSummary doctor={doctor} date={date} time={time} />

      <section className="border-border bg-card shadow-card animate-fade-in-up rounded-xl border p-5 sm:p-6">
        <h2 className="text-foreground mb-4 text-base font-bold">פרטי הבקשה</h2>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="patientName">שם המטופל</Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="שם פרטי ושם משפחה"
              autoComplete="off"
              aria-invalid={Boolean(errors.patientName)}
              aria-describedby={errors.patientName ? "patientName-error" : undefined}
            />
            <FieldError id="patientName-error" message={errors.patientName} />
          </div>

          <div>
            <Label htmlFor="familyContactName">שם בן/בת המשפחה</Label>
            <Input
              id="familyContactName"
              value={familyContactName}
              onChange={(e) => setFamilyContactName(e.target.value)}
              placeholder="שם פרטי ושם משפחה"
              autoComplete="name"
              aria-invalid={Boolean(errors.familyContactName)}
              aria-describedby={
                errors.familyContactName ? "familyContactName-error" : undefined
              }
            />
            <FieldError
              id="familyContactName-error"
              message={errors.familyContactName}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                className="text-start"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              <FieldError id="phone-error" message={errors.phone} />
            </div>

            <div>
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                className="text-start"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              <FieldError id="email-error" message={errors.email} />
            </div>
          </div>
        </div>
      </section>

      <fieldset className="border-border bg-card shadow-card animate-fade-in-up rounded-xl border p-5 sm:p-6 [animation-delay:70ms]">
        <legend className="text-foreground px-1 text-base font-bold">סוג השיחה</legend>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {MEETING_TYPES.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={meetingType === option.value}
              onSelect={() => setMeetingType(option.value)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="border-border bg-card shadow-card animate-fade-in-up rounded-xl border p-5 sm:p-6 [animation-delay:140ms]">
        <legend className="text-foreground px-1 text-base font-bold">
          על מה תרצו לדבר עם הרופא?
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {TOPICS.map((value) => (
            <OptionCard
              key={value}
              label={TOPIC_LABELS[value]}
              selected={topic === value}
              onSelect={() => setTopic(value)}
              className="min-h-15"
            />
          ))}
        </div>

        <div className="mt-4">
          <Label htmlFor="notes" className="flex items-center gap-1.5">
            <MessageSquareText className="text-muted-foreground size-4" aria-hidden />
            מידע נוסף שיכול לעזור לרופא להתכונן
            <span className="text-muted-foreground font-normal">(אופציונלי)</span>
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={400}
          />
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          חזרה
        </Button>
        <Button type="submit" disabled={submitting} className="sm:min-w-44">
          {submitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              קובע שיחה…
            </>
          ) : (
            "קבע שיחה"
          )}
        </Button>
      </div>
    </form>
  );
}

export { BookingForm };
