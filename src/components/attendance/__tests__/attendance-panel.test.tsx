import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      title: "Attendance",
      yourStatus: "Your attendance",
      eventStarted: "Event has already started",
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

vi.mock("@/lib/utils/event-time", () => ({
  hasEventStarted: vi.fn(() => false),
}));

import { AttendancePanel } from "../attendance-panel";
import type { Event, AttendanceWithMember } from "@/lib/db/repositories";

const mockEvent: Event = {
  id: "event-1",
  ensembleId: "ensemble-1",
  name: "Test Event",
  type: "concert",
  date: new Date("2026-04-01T00:00:00Z"),
  time: "18:00",
  place: "Hall",
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAttendance: AttendanceWithMember[] = [
  {
    id: "att-1",
    eventId: "event-1",
    memberId: "member-1",
    status: "unset",
    updatedAt: new Date(),
    memberName: "Alice",
    voiceGroup: "S",
  },
  {
    id: "att-2",
    eventId: "event-1",
    memberId: "member-2",
    status: "yes",
    updatedAt: new Date(),
    memberName: "Bob",
    voiceGroup: "T",
  },
];

describe("AttendancePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it("renders summary and detail tabs", () => {
    render(
      <AttendancePanel
        event={mockEvent}
        attendance={mockAttendance}
        currentMemberId="member-1"
        isAdmin={false}
        isDirectorOrAdmin={false}
      />
    );
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Detail")).toBeInTheDocument();
  });

  it("shows current user's presence button at top", () => {
    render(
      <AttendancePanel
        event={mockEvent}
        attendance={mockAttendance}
        currentMemberId="member-1"
        isAdmin={false}
        isDirectorOrAdmin={false}
      />
    );
    expect(screen.getByText("Your attendance")).toBeInTheDocument();
  });

  it("calls API on status change", async () => {
    render(
      <AttendancePanel
        event={mockEvent}
        attendance={mockAttendance}
        currentMemberId="member-1"
        isAdmin={false}
        isDirectorOrAdmin={false}
      />
    );

    // Click the "Yes" button (first one in the top presence row)
    const yesButtons = screen.getAllByLabelText("Yes");
    fireEvent.click(yesButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/events/event-1/attendance",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ status: "yes" }),
        })
      );
    });
  });
});
