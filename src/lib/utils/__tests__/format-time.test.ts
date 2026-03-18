import { describe, it, expect } from "vitest";
import { formatTimeRange } from "../format-time";

describe("formatTimeRange", () => {
  it("returns just time when no timeTo", () => {
    expect(formatTimeRange("18:00")).toBe("18:00");
  });

  it("returns just time when timeTo is null", () => {
    expect(formatTimeRange("18:00", null)).toBe("18:00");
  });

  it("returns just time when timeTo is undefined", () => {
    expect(formatTimeRange("18:00", undefined)).toBe("18:00");
  });

  it("returns time range when timeTo is provided", () => {
    expect(formatTimeRange("18:00", "20:00")).toBe("18:00 – 20:00");
  });
});
