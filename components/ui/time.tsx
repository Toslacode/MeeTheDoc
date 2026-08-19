import { cn } from "@/lib/utils";

/**
 * Renders a clock time, phone number, or other digit-first string inside
 * RTL text. Without `dir="ltr"` the bidi algorithm reorders "13:30" into
 * garbled digits/punctuation. `tabular-nums` keeps digits aligned when
 * times stack in a column.
 */
function Time({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span dir="ltr" className={cn("tabular-nums", className)}>
      {children}
    </span>
  );
}

export { Time };
