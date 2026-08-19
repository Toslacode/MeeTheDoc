import Link from "next/link";

const ROUTES = [
  "/",
  "/doctor",
  "/doctor/calls",
  "/doctor/availability",
  "/family",
] as const;

/**
 * Scaffold-only placeholder. Renders the route path as visible text plus links
 * to the other placeholder routes so navigation can be verified. Delete once
 * real screens exist.
 */
export function RoutePlaceholder({ route }: { route: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="font-mono text-2xl">{route}</h1>
      <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        {ROUTES.filter((r) => r !== route).map((r) => (
          <Link key={r} href={r} className="underline underline-offset-4">
            {r}
          </Link>
        ))}
      </nav>
    </main>
  );
}
