import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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

import { PresenceButton } from "../presence-button";

describe("PresenceButton", () => {
  it("renders 4 buttons with correct labels", () => {
    render(<PresenceButton status="unset" onStatusChange={() => {}} />);
    expect(screen.getByLabelText("Yes")).toBeInTheDocument();
    expect(screen.getByLabelText("Maybe")).toBeInTheDocument();
    expect(screen.getByLabelText("No")).toBeInTheDocument();
    expect(screen.getByLabelText("Unset")).toBeInTheDocument();
  });

  it("active status has correct color class", () => {
    render(<PresenceButton status="yes" onStatusChange={() => {}} />);
    const yesButton = screen.getByLabelText("Yes");
    expect(yesButton.className).toContain("bg-green-600");
  });

  it("calls onStatusChange on click", () => {
    const onChange = vi.fn();
    render(<PresenceButton status="unset" onStatusChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Yes"));
    expect(onChange).toHaveBeenCalledWith("yes");
  });

  it("all buttons disabled when disabled=true", () => {
    render(
      <PresenceButton status="unset" onStatusChange={() => {}} disabled />
    );
    expect(screen.getByLabelText("Yes")).toBeDisabled();
    expect(screen.getByLabelText("Maybe")).toBeDisabled();
    expect(screen.getByLabelText("No")).toBeDisabled();
    expect(screen.getByLabelText("Unset")).toBeDisabled();
  });
});
