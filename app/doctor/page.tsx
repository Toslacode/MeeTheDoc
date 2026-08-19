import { redirect } from "next/navigation";

/** /doctor is not a screen of its own — the doctor's home is their calls. */
export default function DoctorIndexPage() {
  redirect("/doctor/calls");
}
