import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md text-base font-semibold",
    "transition-[background-color,border-color,box-shadow,transform] duration-150",
    "outline-none focus-visible:ring-ring focus-visible:ring-[3px]",
    "active:scale-[0.985]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5",
  ].join(" "),
  {
    variants: {
      variant: {
        // Solid fills stay fully opaque — white text on a saturated color
        // needs the contrast. btn-specular/btn-sheen give these the same
        // "liquid" family as the glass surfaces below without touching
        // that opacity: a baked-in top highlight plus a light sweep that
        // plays on press (app/globals.css).
        default:
          "btn-specular btn-sheen bg-primary text-primary-foreground shadow-card hover:bg-primary-hover active:bg-primary-active",
        destructive:
          "btn-specular btn-sheen bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Already-translucent surfaces — glass-surface adds the blur,
        // border, and top highlight; the utility class here supplies only
        // the tint (see app/globals.css's .glass-surface comment).
        secondary:
          "glass-surface relative border border-[color:var(--glass-border)] bg-secondary/60 text-foreground hover:bg-secondary/85",
        outline:
          "glass-surface relative border border-[color:var(--glass-border)] bg-card/70 text-foreground hover:bg-secondary/50",
        // Left alone deliberately: ghost has no surface at rest by
        // design, and a permanent frosted panel would fight that role
        // everywhere it's used as a quiet secondary action.
        ghost: "text-primary hover:bg-secondary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Minimum 44px everywhere — comfortable phone targets, per the
        // accessibility requirement. No tiny healthcare-console controls.
        default: "min-h-12 px-5 py-2.5",
        sm: "min-h-11 gap-1.5 rounded-md px-4 text-sm",
        lg: "min-h-14 rounded-lg px-7 text-lg",
        icon: "size-11 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
