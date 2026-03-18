import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventCalendar } from "../event-calendar";
import type { Event } from "@/lib/db/repositories";

const mockPush = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/lib/i18n/routing", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
  usePathname: () => "/events",
}));

const mockEvent: Event = {
  id: "event-1",
  ensembleId: "ensemble-1",
  name: "Spring Concert",
  type: "concert",
  date: new Date("2026-03-15T18:00:00Z"),
  time: "18:00",
  timeTo: null,
  place: "Concert Hall",
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("EventCalendar", () => {
  it("renders the calendar container", () => {
    render(<EventCalendar events={[mockEvent]} canEdit={false} />);
    expect(screen.getByTestId("event-calendar")).toBeInTheDocument();
  });

  it("renders events in the calendar", () => {
    render(<EventCalendar events={[mockEvent]} canEdit={false} />);
    expect(screen.getByText("Spring Concert")).toBeInTheDocument();
  });

  it("shows popover on event click", () => {
    render(<EventCalendar events={[mockEvent]} canEdit={false} />);
    const eventEl = screen.getByText("Spring Concert");
    fireEvent.click(eventEl);
    expect(screen.getByTestId("calendar-event-popover")).toBeInTheDocument();
  });
});
