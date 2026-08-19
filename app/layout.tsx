import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Heebo } from "next/font/google";

import { StoreProvider } from "@/lib/store/context";

import "./globals.css";

/*
 * ─────────────────────────────────────────────────────────────────────────
 * RTL conventions for MeeTheDoc (Hebrew-first, `dir="rtl"` on <html>)
 *
 * Every screen — this one included — must follow these rules so layout
 * stays correct in RTL without special-casing:
 *
 * 1. Logical properties only. Use `ms-*`/`me-*` (margin-inline-start/end),
 *    `ps-*`/`pe-*` (padding-inline-start/end), `start-*`/`end-*` (inset),
 *    `text-start`/`text-end`, `border-s`/`border-e`. NEVER `ml-*`, `mr-*`,
 *    `left-*`, `right-*`, `text-left`, `text-right` — those hard-code a
 *    physical side and silently break under `dir="rtl"`.
 *
 * 2. Directional icons (chevrons, arrows — anything implying "back" or
 *    "forward") must flip between LTR and RTL, because "forward" is the
 *    opposite physical direction in each. Tailwind's `rtl:`/`ltr:`
 *    variants handle this directly on the icon, e.g.
 *      <ChevronRight className="rtl:-scale-x-100" />
 *    Prefer that over swapping which icon you import.
 *
 * 3. Numerals and times stay LTR inside RTL text. A clock time like
 *    "13:30" or a phone number reversed by the RTL algorithm reads as
 *    garbled digits/punctuation. Wrap any standalone time, phone number,
 *    or other digit-first string in the <Time> primitive
 *    (components/ui/time.tsx), which sets `dir="ltr"` on a tabular-nums
 *    span. Reach for a plain `<span dir="ltr">` only for one-off cases
 *    that aren't already covered by that component.
 *
 * These conventions apply to every screen built on this foundation
 * (family booking flow, doctor availability/calls). See also
 * components/ui/option-card.tsx and components/ui/slot-chip.tsx, which
 * bake in the RTL-correct interaction states described above.
 * ─────────────────────────────────────────────────────────────────────────
 */

// Heebo has real Hebrew coverage (unlike Geist, which this replaces) and
// is wired as --font-sans in app/globals.css.
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MeeTheDoc",
  description: "תיאום שיחות בין משפחות לרופאים המטפלים — פשוט, מסודר ומאובטח.",
  icons: {
    icon: "/assets/branding/logo.png",
    apple: "/assets/branding/logo.png",
  },
  openGraph: {
    title: "MeeTheDoc",
    description: "תיאום שיחות בין משפחות לרופאים המטפלים — פשוט, מסודר ומאובטח.",
    images: [{ url: "/assets/branding/logo.png", width: 1254, height: 1254 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} h-full antialiased`}
    >
      <body className="bg-background min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
