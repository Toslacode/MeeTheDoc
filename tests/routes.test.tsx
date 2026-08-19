import type { ReactElement } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DoctorAvailabilityPage from "@/app/doctor/availability/page";
import DoctorCallsPage from "@/app/doctor/calls/page";
import DoctorPage from "@/app/doctor/page";
import FamilyPage from "@/app/family/page";
import HomePage from "@/app/page";

const PAGES: Array<[route: string, Page: () => ReactElement]> = [
  ["/", HomePage],
  ["/doctor", DoctorPage],
  ["/doctor/calls", DoctorCallsPage],
  ["/doctor/availability", DoctorAvailabilityPage],
  ["/family", FamilyPage],
];

describe("placeholder routes", () => {
  it.each(PAGES)("%s renders its own route name", (route, Page) => {
    render(<Page />);

    const heading = screen.getByRole("heading", { level: 1 });

    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe(route);
  });
});
