import { doctorInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Doctor } from "@/types";

/**
 * A doctor's picture, falling back to their initials. Deliberately NOT a
 * generic person glyph — a silhouette icon in every empty avatar is one of
 * the clearest "unfinished template" tells, and initials carry real
 * identity at no cost.
 */
function DoctorAvatar({
  doctor,
  className,
  textClassName,
}: {
  doctor: Pick<Doctor, "name" | "avatarDataUrl"> | null;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span
      className={cn(
        "bg-secondary text-primary relative flex shrink-0 items-center justify-center",
        "overflow-hidden rounded-full font-bold",
        className
      )}
    >
      {doctor?.avatarDataUrl ? (
        /* User-supplied data URL: next/image cannot optimise a data URL,
           so it would add indirection for no benefit. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doctor.avatarDataUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={textClassName}>
          {doctor ? doctorInitials(doctor.name) : ""}
        </span>
      )}
    </span>
  );
}

export { DoctorAvatar };
