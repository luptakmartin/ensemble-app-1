import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { PresenceNote } from "../presence-note";

const EVENT_ID = "evt-123";

function mockFetchOk() {
  global.fetch = vi.fn().mockResolvedValue({ ok: true });
}

describe("PresenceNote", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockFetchOk();
  });

  it("renders add note button when no note", () => {
    render(
      <PresenceNote eventId={EVENT_ID} note={null} onNoteChange={() => {}} />
    );
    expect(screen.getByText("addNote")).toBeInTheDocument();
  });

  it("shows textarea when add note clicked", () => {
    render(
      <PresenceNote eventId={EVENT_ID} note={null} onNoteChange={() => {}} />
    );
    fireEvent.click(screen.getByText("addNote"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders note text when note exists", () => {
    render(
      <PresenceNote eventId={EVENT_ID} note="Hello" onNoteChange={() => {}} />
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("shows edit and delete buttons with aria-labels when note exists", () => {
    render(
      <PresenceNote eventId={EVENT_ID} note="Hello" onNoteChange={() => {}} />
    );
    expect(screen.getByLabelText("editNote")).toBeInTheDocument();
    expect(screen.getByLabelText("deleteNote")).toBeInTheDocument();
  });

  it("saves note via API", async () => {
    const onNoteChange = vi.fn();
    render(
      <PresenceNote
        eventId={EVENT_ID}
        note={null}
        onNoteChange={onNoteChange}
      />
    );

    fireEvent.click(screen.getByText("addNote"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "typed text" },
    });
    fireEvent.click(screen.getByText("save"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/events/${EVENT_ID}/attendance`,
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: "typed text" }),
        })
      );
    });

    await waitFor(() => {
      expect(onNoteChange).toHaveBeenCalledWith("typed text");
    });
  });

  it("deletes note via API", async () => {
    const onNoteChange = vi.fn();
    render(
      <PresenceNote
        eventId={EVENT_ID}
        note="Hello"
        onNoteChange={onNoteChange}
      />
    );

    fireEvent.click(screen.getByLabelText("deleteNote"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/events/${EVENT_ID}/attendance`,
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: null }),
        })
      );
    });

    await waitFor(() => {
      expect(onNoteChange).toHaveBeenCalledWith(null);
    });
  });

  it("cancels editing", () => {
    render(
      <PresenceNote eventId={EVENT_ID} note={null} onNoteChange={() => {}} />
    );

    fireEvent.click(screen.getByText("addNote"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "something" },
    });
    fireEvent.click(screen.getByText("cancel"));

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("hides edit/delete when disabled", () => {
    render(
      <PresenceNote
        eventId={EVENT_ID}
        note="Hello"
        onNoteChange={() => {}}
        disabled
      />
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.queryByLabelText("editNote")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("deleteNote")).not.toBeInTheDocument();
  });
});
