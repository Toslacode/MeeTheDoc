"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, Lock, Mail, ShieldCheck, Users } from "lucide-react";

import { MeeTheDocLogo } from "@/components/brand/meethedoc-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Simulated doctor sign-in. Authentication is NOT implemented in this
 * phase: submitting simply navigates to the doctor's home. The form is
 * kept as a real controlled form so wiring a genuine auth call later is a
 * change to `handleSubmit` alone.
 *
 * Families never sign in — they always arrive through their department
 * link, so the only family affordance here is a way through to /family.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push("/doctor/calls");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <header className="mb-7 flex flex-col items-center text-center">
          <MeeTheDocLogo size="xl" className="animate-fade-in-up" />
          <h1 className="text-foreground animate-fade-in-up mt-4 text-4xl font-extrabold tracking-tight [animation-delay:60ms]">
            MeeTheDoc
          </h1>
          <p className="text-muted-foreground animate-fade-in-up mt-2 text-base [animation-delay:110ms]">
            תיאום שיחות בין משפחות לרופאים
          </p>
          <p className="text-primary animate-fade-in-up mt-1 text-base font-bold [animation-delay:150ms]">
            פשוט. מסודר. אנושי.
          </p>
        </header>

        <section className="border-border bg-card shadow-card animate-fade-in-up rounded-xl border p-5 [animation-delay:200ms] sm:p-6">
          <h2 className="text-foreground text-xl font-extrabold">כניסה</h2>
          <p className="text-muted-foreground mt-1 mb-5 text-sm">
            היכנסו כדי לנהל זמינות ושיחות
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email">אימייל</Label>
              <div className="relative">
                <Mail
                  className="text-muted-foreground pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  className="pe-11 text-start"
                  placeholder="doctor@hospital.org"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <Lock
                  className="text-muted-foreground pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  id="password"
                  type="password"
                  dir="ltr"
                  className="pe-11 text-start"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="text-primary mt-2 text-sm font-semibold hover:underline"
              >
                שכחת סיסמה?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full">
              היכנס
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-sm">או</span>
            <span className="bg-border h-px flex-1" />
          </div>

          {/* Visual only in this phase — real Google OAuth comes later. */}
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => router.push("/doctor/calls")}
          >
            <GoogleMark />
            היכנס עם Google
          </Button>
        </section>

        <section className="border-border bg-secondary/55 animate-fade-in-up mt-6 flex items-center gap-3 rounded-xl border p-4 [animation-delay:260ms]">
          <span className="bg-card text-primary flex size-11 shrink-0 items-center justify-center rounded-full">
            <Users className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-primary text-sm font-bold">משפחה?</p>
            <p className="text-muted-foreground text-sm">לקביעת שיחה עם הרופא</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/family">
              המשך כמשפחה
              <ChevronLeft className="rtl:-scale-x-100" aria-hidden />
            </Link>
          </Button>
        </section>

        <p className="text-muted-foreground mt-6 flex items-center justify-center gap-1.5 text-xs">
          <ShieldCheck className="size-3.5" aria-hidden />
          המידע שלך מאובטח ומוגן
        </p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.2 5.3-4.7 6.9l7.6 5.9c4.4-4.1 6.8-10.750 6.8-17.3z"/>
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C.9 16.3 0 20 0 24s.9 7.7 2.6 10.8l7.8-6.1z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.4 0-11.7-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  );
}
