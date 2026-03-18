import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { RsvpSection } from "../rsvp-section";

describe("RsvpSection", () => {
  it("renders RSVP heading", () => {
    render(
      <RsvpSection
        eventId="evt-1"
        status="unset"
        note={null}
        onStatusChange={() => {}}
        onNoteChange={() => {}}
      />
    );
    expect(screen.getByText("RSVP")).toBeInTheDocument();
  });

  it("renders PresenceButton and PresenceNote", () => {
    render(
      <RsvpSection
        eventId="evt-1"
        status="yes"
        note="my note"
        onStatusChange={() => {}}
        onNoteChange={() => {}}
      />
    );
    // PresenceButton renders aria-labels for each status
    expect(screen.getByLabelText("yes")).toBeInTheDocument();
    // PresenceNote renders the note text
    expect(screen.getByText("my note")).toBeInTheDocument();
  });

  it("shows disabled message when provided", () => {
    render(
      <RsvpSection
        eventId="evt-1"
        status="unset"
        note={null}
        onStatusChange={() => {}}
        onNoteChange={() => {}}
        disabled
        disabledMessage="Event has started"
      />
    );
    expect(screen.getByText("Event has started")).toBeInTheDocument();
  });
});
