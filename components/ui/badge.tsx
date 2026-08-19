import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        // Green appears here and nowhere else: status only, never an action.
        scheduled: "bg-secondary text-primary",
        completed: "bg-[#e8f6ed] text-success",
        cancelled: "bg-[#fdeaea] text-destructive",
        no_answer: "bg-[#f1f3f7] text-muted-foreground",
        info: "bg-secondary text-primary",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

function Badge({
  className,
  variant,
  withDot = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { withDot?: boolean }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {withDot ? (
        <span className="size-1.5 shrink-0 rounded-full bg-current" />
      ) : null}
      {props.children}
    </span>
  );
}

export { Badge, badgeVariants };
