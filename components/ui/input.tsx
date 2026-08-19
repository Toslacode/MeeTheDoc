import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // min-h-12 keeps the touch target comfortable on mobile — this is a
        // healthcare product, not a dense admin console.
        "border-input bg-card text-foreground placeholder:text-muted-foreground/70",
        "min-h-12 w-full rounded-md border px-3.5 py-2.5 text-base",
        "transition-[color,box-shadow,border-color] outline-none",
        "focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-[3px]",
        "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
