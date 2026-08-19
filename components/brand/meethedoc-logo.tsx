import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Renders the APPROVED MeeTheDoc brand mark. This is a thin sizing/layout
 * wrapper around the source image at
 * public/assets/branding/logo.png (an ASCII-filename copy of the original
 * public/assets/branding/אייקון.png — see that folder for why both exist).
 * It never redraws, recomposes, or recolors the artwork.
 *
 * The source PNG has no alpha channel and a near-white studio background
 * with a soft drop-shadow baked in. A background-removal experiment
 * (scripts/process-logo.mjs) left a visible halo on colored surfaces — see
 * that script's header comment for the full writeup — so instead the mark
 * is presented untouched inside a plain white rounded container, which
 * reads as an app icon and matches the design references.
 */

const logoContainerVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-white shadow-card overflow-hidden",
  {
    variants: {
      size: {
        sm: "size-8 p-0.5",
        md: "size-12 p-1.5",
        lg: "size-20 p-2.5",
        xl: "size-28 p-3.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const LOGO_PIXELS_BY_SIZE = {
  sm: 32,
  md: 48,
  lg: 80,
  xl: 112,
} as const satisfies Record<
  NonNullable<VariantProps<typeof logoContainerVariants>["size"]>,
  number
>;

interface MeeTheDocLogoProps
  extends VariantProps<typeof logoContainerVariants> {
  className?: string;
}

function MeeTheDocLogo({ size = "md", className }: MeeTheDocLogoProps) {
  const resolvedSize = size ?? "md";
  const pixels = LOGO_PIXELS_BY_SIZE[resolvedSize];

  return (
    <span className={cn(logoContainerVariants({ size }), className)}>
      <Image
        src="/assets/branding/logo.png"
        alt="MeeTheDoc"
        width={pixels}
        height={pixels}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export { MeeTheDocLogo };
