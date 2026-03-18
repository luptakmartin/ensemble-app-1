import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      "members.title": "Members",
      "members.voiceGroups.S": "Soprano",
      "members.voiceGroups.A": "Alto",
      "members.voiceGroups.T": "Tenor",
      "members.voiceGroups.B": "Bass",
      "presence.unassigned": "Unassigned",
      "statistics.notePopupTitle": "Attendance Note",
    };
    return map[key] ?? key;
  },
  useLocale: () => "en",
}));

vi.mock("date-fns/locale", async () => {
  const actual = await vi.importActual("date-fns/locale");
  return actual;
});

vi.mock("@/lib/i18n/routing", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { StatisticsTable } from "../statistics-table";
import type { Event, Member, AttendanceWithMember } from "@/lib/db/repositories";

const mockEvents: Event[] = [
  {
    id: "event-1",
    ensembleId: "ens-1",
    name: "Rehearsal 1",
    type: "regular_rehearsal",
    date: new Date("2026-03-10"),
    time: "18:00",
    timeTo: null,
    place: "Hall",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "event-2",
    ensembleId: "ens-1",
    name: "Concert",
    type: "concert",
    date: new Date("2026-03-15"),
    time: "19:00",
    timeTo: null,
    place: "Theater",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMembers: Member[] = [
  { id: "m-1", ensembleId: "ens-1", userId: "u-1", name: "Alice", email: "a@test.com", phone: null, profilePicture: null, voiceGroup: "S", createdAt: new Date(), updatedAt: new Date(), roles: ["member"] },
  { id: "m-2", ensembleId: "ens-1", userId: "u-2", name: "Bob", email: "b@test.com", phone: null, profilePicture: null, voiceGroup: "T", createdAt: new Date(), updatedAt: new Date(), roles: ["member"] },
  { id: "m-3", ensembleId: "ens-1", userId: "u-3", name: "Carol", email: "c@test.com", phone: null, profilePicture: null, voiceGroup: "S", createdAt: new Date(), updatedAt: new Date(), roles: ["member"] },
];

const mockAttendance: AttendanceWithMember[] = [
  { id: "a-1", eventId: "event-1", memberId: "m-1", status: "yes", note: null, updatedAt: new Date(), memberName: "Alice", voiceGroup: "S", profilePicture: null },
  { id: "a-2", eventId: "event-1", memberId: "m-2", status: "no", note: "sick", updatedAt: new Date(), memberName: "Bob", voiceGroup: "T", profilePicture: null },
  { id: "a-3", eventId: "event-2", memberId: "m-1", status: "maybe", note: null, updatedAt: new Date(), memberName: "Alice", voiceGroup: "S", profilePicture: null },
  { id: "a-4", eventId: "event-2", memberId: "m-3", status: "unset", note: null, updatedAt: new Date(), memberName: "Carol", voiceGroup: "S", profilePicture: null },
];

describe("StatisticsTable", () => {
  it("renders member names", () => {
    render(<StatisticsTable events={mockEvents} members={mockMembers} attendance={mockAttendance} currentMemberId="m-1" isDirectorOrAdmin={true} onAttendanceUpdate={vi.fn()} />);
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.getByText("Carol")).toBeDefined();
  });

  it("renders voice group headers", () => {
    render(<StatisticsTable events={mockEvents} members={mockMembers} attendance={mockAttendance} currentMemberId="m-1" isDirectorOrAdmin={true} onAttendanceUpdate={vi.fn()} />);
    expect(screen.getByText("Soprano")).toBeDefined();
    expect(screen.getByText("Tenor")).toBeDefined();
  });

  it("renders event date columns", () => {
    render(<StatisticsTable events={mockEvents} members={mockMembers} attendance={mockAttendance} currentMemberId="m-1" isDirectorOrAdmin={true} onAttendanceUpdate={vi.fn()} />);
    // EN format "MMM d, yy" -> "Mar 10, 26", "Mar 15, 26"
    expect(screen.getByText("Mar 10, 26")).toBeDefined();
    expect(screen.getByText("Mar 15, 26")).toBeDefined();
  });

  it("renders status icons", () => {
    const { container } = render(<StatisticsTable events={mockEvents} members={mockMembers} attendance={mockAttendance} currentMemberId="m-1" isDirectorOrAdmin={true} onAttendanceUpdate={vi.fn()} />);
    // Check for green (yes), red (no), blue (maybe), gray (unset) icon classes
    expect(container.querySelector(".text-green-600")).toBeDefined();
    expect(container.querySelector(".text-red-600")).toBeDefined();
    expect(container.querySelector(".text-blue-600")).toBeDefined();
    expect(container.querySelector(".text-gray-400")).toBeDefined();
  });

  it("has sticky first column", () => {
    const { container } = render(<StatisticsTable events={mockEvents} members={mockMembers} attendance={mockAttendance} currentMemberId="m-1" isDirectorOrAdmin={true} onAttendanceUpdate={vi.fn()} />);
    const stickyCells = container.querySelectorAll(".sticky.left-0");
    expect(stickyCells.length).toBeGreaterThan(0);
  });

  it("renders member links to member detail", () => {
    const { container } = render(<StatisticsTable events={mockEvents} members={mockMembers} attendance={mockAttendance} currentMemberId="m-1" isDirectorOrAdmin={true} onAttendanceUpdate={vi.fn()} />);
    const memberLinks = container.querySelectorAll('a[href*="/members/"]');
    expect(memberLinks.length).toBe(3);
  });

  it("renders event links to event detail", () => {
    const { container } = render(<StatisticsTable events={mockEvents} members={mockMembers} attendance={mockAttendance} currentMemberId="m-1" isDirectorOrAdmin={true} onAttendanceUpdate={vi.fn()} />);
    const eventLinks = container.querySelectorAll('a[href*="/events/"]');
    expect(eventLinks.length).toBe(2);
  });
});
