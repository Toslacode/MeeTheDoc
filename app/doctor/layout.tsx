import { DoctorBottomNav, DoctorSidebar } from "@/components/doctor/doctor-nav";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <DoctorSidebar />
      {/* pb leaves room for the fixed bottom bar on phones only. */}
      <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>
      <DoctorBottomNav />
    </div>
  );
}
