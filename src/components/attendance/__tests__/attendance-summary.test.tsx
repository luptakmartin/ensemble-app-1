import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      yes: "Yes",
      maybe: "Maybe",
      no: "No",
      unset: "Unset",
    };
    return map[key] ?? key;
  },
}));

import { AttendanceSummary } from "../attendance-summary";

describe("AttendanceSummary", () => {
  it("renders counts for each status", () => {
    render(
      <AttendanceSummary
        counts={{ yes: 5, maybe: 3, no: 2, unset: 1 }}
        total={11}
      />
    );
    expect(screen.getByText("Yes: 5")).toBeInTheDocument();
    expect(screen.getByText("Maybe: 3")).toBeInTheDocument();
    expect(screen.getByText("No: 2")).toBeInTheDocument();
    expect(screen.getByText("Unset: 1")).toBeInTheDocument();
  });

  it("shows colored bar segments", () => {
    const { container } = render(
      <AttendanceSummary
        counts={{ yes: 5, maybe: 3, no: 2, unset: 0 }}
        total={10}
      />
    );
    const bar = container.querySelector(".rounded-full");
    expect(bar).not.toBeNull();
    const segments = bar!.children;
    expect(segments.length).toBe(3); // unset=0 so not rendered
  });
});
