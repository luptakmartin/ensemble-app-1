import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      title: "Attendance",
      summary: "Summary",
      detail: "Detail",
      yes: "Yes",
      maybe: "Maybe",
      no: "No",
      unset: "Unset",
      unassigned: "Unassigned",
    };
    return map[key] ?? key;
  },
}));

import { AttendancePanel } from "../attendance-panel";
import type { AttendanceWithMember } from "@/lib/db/repositories";

const mockAttendance: AttendanceWithMember[] = [
  {
    id: "att-1",
    eventId: "event-1",
    memberId: "member-1",
    status: "unset",
    note: null,
    updatedAt: new Date(),
    memberName: "Alice",
    voiceGroup: "S",
  },
  {
    id: "att-2",
    eventId: "event-1",
    memberId: "member-2",
    status: "yes",
    note: null,
    updatedAt: new Date(),
    memberName: "Bob",
    voiceGroup: "T",
  },
];

describe("AttendancePanel", () => {
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders summary and detail tabs", () => {
    render(
      <AttendancePanel
        attendance={mockAttendance}
        currentMemberId="member-1"
        isAdmin={false}
        isDirectorOrAdmin={false}
        eventStarted={false}
        onStatusChange={mockOnStatusChange}
      />
    );
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Detail")).toBeInTheDocument();
  });

  it("renders attendance heading", () => {
    render(
      <AttendancePanel
        attendance={mockAttendance}
        currentMemberId="member-1"
        isAdmin={false}
        isDirectorOrAdmin={false}
        eventStarted={false}
        onStatusChange={mockOnStatusChange}
      />
    );
    expect(screen.getByText("Attendance")).toBeInTheDocument();
  });

  it("does not render 'Your Status' section (moved to RsvpSection)", () => {
    render(
      <AttendancePanel
        attendance={mockAttendance}
        currentMemberId="member-1"
        isAdmin={false}
        isDirectorOrAdmin={false}
        eventStarted={false}
        onStatusChange={mockOnStatusChange}
      />
    );
    expect(screen.queryByText("Your attendance")).not.toBeInTheDocument();
  });
});
