import { useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";

import { MeeTheDocLogo } from "@/components/brand/meethedoc-logo";

/** Shared chrome for every step of the family flow: brand mark, the
 * department the link belongs to, and the step's own title. */
function FamilyShell({
  departmentName,
  title,
  subtitle,
  children,
}: {
  departmentName: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // The parent remounts a fresh FamilyShell on every family-flow step
    // change (`key={step}` on the wrapper in app/family/page.tsx), so this
    // runs once per step and moves focus onto the new step instead of
    // leaving a screen-reader user on a control that just left the DOM.
    // The success step passes an empty title (it renders its own heading
    // inside `children`), so fall back to the landmark itself there.
    if (title) {
      headingRef.current?.focus();
    } else {
      mainRef.current?.focus();
    }
  }, [title]);

  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-7 pb-14 outline-none sm:px-6 sm:pt-10"
    >
      <header className="mb-6 flex flex-col items-center text-center">
        <MeeTheDocLogo size="lg" />

        <span className="text-primary mt-3.5 flex items-center gap-1.5 text-sm font-semibold">
          <ShieldCheck className="size-4" aria-hidden />
          {departmentName}
        </span>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-foreground mt-1.5 text-2xl font-extrabold text-balance outline-none sm:text-3xl"
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </header>

      {children}
    </main>
  );
}

export { FamilyShell };
