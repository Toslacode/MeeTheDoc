import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-secondary skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
