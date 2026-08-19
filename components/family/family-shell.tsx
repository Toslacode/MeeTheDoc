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
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-7 pb-14 sm:px-6 sm:pt-10">
      <header className="mb-6 flex flex-col items-center text-center">
        <MeeTheDocLogo size="lg" />

        <span className="text-primary mt-3.5 flex items-center gap-1.5 text-sm font-semibold">
          <ShieldCheck className="size-4" aria-hidden />
          {departmentName}
        </span>

        <h1 className="text-foreground mt-1.5 text-2xl font-extrabold text-balance sm:text-3xl">
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
