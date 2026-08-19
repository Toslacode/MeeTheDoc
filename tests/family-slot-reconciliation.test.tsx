import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import FamilyPage from "@/app/family/page";
import { StoreProvider } from "@/lib/store/context";
import { resetDemoData, setDayAvailability } from "@/lib/store/api";
import { todayIso } from "@/lib/format";

/**
 * Regression test for the "vanishing slot" bug: a family selects a slot
 * (or gets as far as the details form) and the doctor unpublishes that
 * exact slot before the family submits. The store here is a genuine
 * module singleton — calling lib/store/api.ts directly, from the same
 * process a rendered FamilyPage is subscribed to, mutates the same state
 * useSyncExternalStore notifies it about, which is exactly what would
 * happen the moment this store gains real cross-session sync (the
 * planned next phase). Without the fix in app/family/page.tsx, the page
 * silently falls through to the doctor-list screen instead of recovering.
 */
describe("family flow recovers when the selected slot disappears", () => {
  beforeEach(async () => {
    await resetDemoData();
  });

  it("shows the slot-taken message instead of silently returning to the doctor list", async () => {
    render(
      <StoreProvider>
        <FamilyPage />
      </StoreProvider>
    );

    fireEvent.click(await screen.findByRole("button", { name: /יעל כהן/ }));

    // Pick the first available slot chip.
    const firstSlot = (
      await screen.findAllByRole("button", { pressed: false })
    ).find((el) => /^\d{2}:\d{2}$/.test(el.textContent?.trim() ?? ""));
    if (!firstSlot) throw new Error("expected at least one available slot");
    fireEvent.click(firstSlot);
    fireEvent.click(screen.getByRole("button", { name: "המשך" }));

    // Reached the details step and started filling it in.
    const patientField = await screen.findByLabelText("שם המטופל");
    fireEvent.change(patientField, { target: { value: "בדיקה בדיקה" } });
    expect(patientField).toHaveValue("בדיקה בדיקה");

    // The doctor unpublishes everything for today — including the slot the
    // family just selected — via the same sanctioned write surface the
    // real availability page uses.
    await setDayAvailability("doc-yael-cohen", todayIso(), []);

    // Recovers to the slot-picking step with an explanation, rather than
    // silently discarding the in-progress form and falling through to the
    // doctor list.
    await waitFor(() => {
      expect(
        screen.getByText("הזמן שנבחר כבר אינו פנוי. נא לבחור זמן אחר.")
      ).toBeInTheDocument();
    });
    expect(screen.queryByLabelText("שם המטופל")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "קביעת שיחה עם רופא המחלקה" })
    ).not.toBeInTheDocument();
  });
});
