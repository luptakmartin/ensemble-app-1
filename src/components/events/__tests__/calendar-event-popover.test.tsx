import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarEventPopover } from "../calendar-event-popover";
import type { Event } from "@/lib/db/repositories";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      yourStatus: "Your attendance",
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

global.fetch = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ status: "yes" }),
});

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

describe("CalendarEventPopover", () => {
  it("renders event name and details", () => {
    render(
      <CalendarEventPopover
        event={mockEvent}
        rect={{ x: 100, y: 200 }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Spring Concert")).toBeInTheDocument();
    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.getByText("Concert Hall")).toBeInTheDocument();
  });

  it("renders a link to the event detail page", () => {
    render(
      <CalendarEventPopover
        event={mockEvent}
        rect={{ x: 100, y: 200 }}
        onClose={vi.fn()}
      />
    );
    const link = screen.getByText("Spring Concert").closest("a");
    expect(link).toHaveAttribute("href", "/events/event-1");
  });

  it("renders presence button", () => {
    render(
      <CalendarEventPopover
        event={mockEvent}
        rect={{ x: 100, y: 200 }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Your attendance")).toBeInTheDocument();
  });
});
