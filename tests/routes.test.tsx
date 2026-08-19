import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StoreProvider } from "@/lib/store/context";
import LoginPage from "@/app/page";
import FamilyPage from "@/app/family/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

function renderWithStore(ui: React.ReactElement) {
  return render(<StoreProvider>{ui}</StoreProvider>);
}

describe("routes render", () => {
  it("/ renders the MeeTheDoc sign-in", () => {
    renderWithStore(<LoginPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "MeeTheDoc" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "כניסה" })).toBeInTheDocument();
  });

  it("/family asks the family to choose a doctor", () => {
    renderWithStore(<FamilyPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "קביעת שיחה עם רופא המחלקה" })
    ).toBeInTheDocument();
  });
});
