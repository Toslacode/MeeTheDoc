import { DoctorBottomNav } from "@/components/doctor/doctor-nav";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      {/* Bottom padding clears the fixed nav at every breakpoint. */}
      <div className="pb-28 sm:pb-32">{children}</div>
      <DoctorBottomNav />
    </div>
  );
}
