"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";

import { DoctorAvatar } from "@/components/doctor/doctor-avatar";
import { setDoctorAvatar } from "@/lib/store/api";
import type { Doctor } from "@/types";

/** Longest edge after downscaling. Retina-sharp at the sizes we render. */
const MAX_EDGE = 256;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Downscales in a canvas before storing. The entire store is persisted to
 * localStorage, so an untouched multi-megabyte camera photo would blow the
 * quota and silently break persistence for everything else.
 */
async function toDownscaledDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

function AvatarPicker({ doctor }: { doctor: Doctor | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Allow re-picking the same file straight after a failure.
    event.target.value = "";
    if (!file || !doctor) return;

    if (!ACCEPTED.includes(file.type)) {
      setError("אפשר להעלות קובץ JPG, PNG או WebP");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await toDownscaledDataUrl(file);
      await setDoctorAvatar(doctor.id, dataUrl);
    } catch {
      setError("לא הצלחנו לטעון את התמונה. נסו קובץ אחר.");
    } finally {
      setBusy(false);
    }
  }

  const hasPhoto = Boolean(doctor?.avatarDataUrl);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <DoctorAvatar
          doctor={doctor}
          className="size-24 text-2xl"
          textClassName="text-2xl"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || !doctor}
          aria-label={hasPhoto ? "החלפת תמונת פרופיל" : "הוספת תמונת פרופיל"}
          className={[
            "bg-primary text-primary-foreground absolute -bottom-1 -end-1",
            "flex size-9 items-center justify-center rounded-full",
            "border-card border-2 shadow-card",
            "transition-[background-color,transform] duration-150 ease-out",
            "hover:bg-primary-hover active:scale-[0.94]",
            "outline-none focus-visible:ring-ring focus-visible:ring-[3px]",
            "disabled:opacity-60",
          ].join(" ")}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Camera className="size-4" aria-hidden />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          onChange={handleFile}
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      {hasPhoto ? (
        <button
          type="button"
          onClick={() => doctor && void setDoctorAvatar(doctor.id, null)}
          className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition-colors outline-none focus-visible:ring-ring focus-visible:ring-[3px]"
        >
          <Trash2 className="size-3.5" aria-hidden />
          הסרת התמונה
        </button>
      ) : null}

      {error ? (
        <p role="alert" className="text-destructive text-center text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { AvatarPicker };
