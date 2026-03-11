import { describe, it, expect, vi, afterEach } from "vitest";
import { hasEventStarted } from "../event-time";

describe("hasEventStarted", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false for future events", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T10:00:00Z"));

    expect(hasEventStarted("2026-03-15T00:00:00Z", "18:00")).toBe(false);
  });

  it("returns true for past events", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T20:00:00Z"));

    expect(hasEventStarted("2026-03-15T00:00:00Z", "18:00")).toBe(true);
  });

  it("returns false when event time has not yet been reached on event day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T16:00:00Z"));

    expect(hasEventStarted("2026-03-15T00:00:00Z", "18:00")).toBe(false);
  });

  it("accepts Date objects", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T20:00:00Z"));

    expect(hasEventStarted(new Date("2026-03-15T00:00:00Z"), "18:00")).toBe(true);
  });
});
