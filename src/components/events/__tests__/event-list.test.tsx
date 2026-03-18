import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventList } from "../event-list";
import type { Event } from "@/lib/db/repositories";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      upcoming: "Upcoming",
      past: "Past",
      create: "Create Event",
      noUpcoming: "No upcoming events.",
      noPast: "No past events.",
      cardView: "Cards",
      calendarView: "Calendar",
    };
    return labels[key] ?? key;
  },
  useLocale: () => "en",
}));

vi.mock("@/lib/i18n/routing", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/events",
}));

const mockEvent: Event = {
  id: "event-1",
  ensembleId: "ensemble-1",
  name: "Test Event",
  type: "concert",
  date: new Date("2026-06-01T18:00:00Z"),
  time: "18:00",
  timeTo: null,
  place: "Concert Hall",
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("EventList", () => {
  it("renders upcoming tab by default", () => {
    render(
      <EventList
        upcomingEvents={[mockEvent]}
        pastEvents={[]}
        allEvents={[mockEvent]}
        canEdit={false}
      />
    );
    expect(screen.getByText("Test Event")).toBeInTheDocument();
  });

  it("shows empty state when no upcoming events", () => {
    render(
      <EventList upcomingEvents={[]} pastEvents={[]} allEvents={[]} canEdit={false} />
    );
    expect(screen.getByText("No upcoming events.")).toBeInTheDocument();
  });

  it('shows "Create Event" button when canEdit is true', () => {
    render(
      <EventList upcomingEvents={[]} pastEvents={[]} allEvents={[]} canEdit={true} />
    );
    expect(screen.getByText("Create Event")).toBeInTheDocument();
  });

  it('hides "Create Event" button when canEdit is false', () => {
    render(
      <EventList upcomingEvents={[]} pastEvents={[]} allEvents={[]} canEdit={false} />
    );
    expect(screen.queryByText("Create Event")).not.toBeInTheDocument();
  });
});
