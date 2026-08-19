import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import DoctorAvailabilityPage from "@/app/doctor/availability/page";
import { StoreProvider } from "@/lib/store/context";
import { resetDemoData, setDoctorAvatar } from "@/lib/store/api";

/**
 * Regression test for the "unsaved selection gets wiped" bug: the doctor
 * toggles a time on but hasn't hit "פרסם זמינות" yet, and something
 * completely unrelated mutates the store in the meantime (here: another
 * doctor's avatar changes). The store is a genuine module singleton, so
 * this reaches the exact same `storeState` subscription the real app
 * uses — before the fix, the availability-seeding effect was keyed on
 * that whole store object and re-ran on any change anywhere, silently
 * reverting the not-yet-published toggle back to whatever was last
 * actually published.
 */
describe("availability page keeps unsaved toggles across unrelated store changes", () => {
  beforeEach(async () => {
    await resetDemoData();
  });

  it("does not revert a toggled-but-unpublished time when another doctor's data changes", async () => {
    render(
      <StoreProvider>
        <DoctorAvailabilityPage />
      </StoreProvider>
    );

    // 14:00 is outside the seeded slots for ד"ר יעל כהן (the default
    // acting doctor), so it starts unpublished/unselected.
    const time = await screen.findByRole("button", { name: "14:00" });
    expect(time).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(time);
    await waitFor(() => expect(time).toHaveAttribute("aria-pressed", "true"));

    // Something unrelated mutates the store while this page is still
    // mounted — a different doctor entirely, nothing to do with today's
    // availability for ד"ר יעל כהן.
    await setDoctorAvatar("doc-itai-levi", null);

    // The unsaved toggle survives; it must only be cleared by an explicit
    // publish, a doctor switch, or a day change — never a side effect of
    // unrelated store activity.
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "14:00" })
      ).toHaveAttribute("aria-pressed", "true");
    });
  });
});
