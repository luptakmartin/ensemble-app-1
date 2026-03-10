import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventTypeBadge } from "../event-type-badge";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      "types.regular_rehearsal": "Regular Rehearsal",
      "types.exceptional_rehearsal": "Exceptional Rehearsal",
      "types.general_rehearsal": "General Rehearsal",
      "types.concert": "Concert",
      "types.meeting": "Meeting",
    };
    return labels[key] ?? key;
  },
}));

describe("EventTypeBadge", () => {
  const types = [
    { type: "regular_rehearsal" as const, label: "Regular Rehearsal", color: "blue" },
    { type: "exceptional_rehearsal" as const, label: "Exceptional Rehearsal", color: "orange" },
    { type: "general_rehearsal" as const, label: "General Rehearsal", color: "purple" },
    { type: "concert" as const, label: "Concert", color: "green" },
    { type: "meeting" as const, label: "Meeting", color: "gray" },
  ];

  types.forEach(({ type, label, color }) => {
    it(`renders correct label for ${type}`, () => {
      render(<EventTypeBadge type={type} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it(`applies ${color} color class for ${type}`, () => {
      render(<EventTypeBadge type={type} />);
      const badge = screen.getByText(label);
      expect(badge.className).toContain(color);
    });
  });
});
