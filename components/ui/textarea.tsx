import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-card text-foreground placeholder:text-muted-foreground/70",
        "min-h-22 w-full resize-y rounded-md border px-3.5 py-2.5 text-base",
        "transition-[color,box-shadow,border-color] outline-none",
        "focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-[3px]",
        "aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
