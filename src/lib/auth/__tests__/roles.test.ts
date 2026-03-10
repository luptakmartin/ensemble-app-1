import { describe, it, expect } from "vitest";
import { hasRole } from "../roles";

describe("hasRole", () => {
  it("returns true when user has one of the required roles", () => {
    expect(hasRole(["admin", "member"], ["admin"])).toBe(true);
    expect(hasRole(["director"], ["admin", "director"])).toBe(true);
  });

  it("returns false when user lacks required roles", () => {
    expect(hasRole(["member"], ["admin", "director"])).toBe(false);
  });

  it("returns false for empty user roles", () => {
    expect(hasRole([], ["admin"])).toBe(false);
  });

  it("returns false for empty required roles", () => {
    expect(hasRole(["admin"], [])).toBe(false);
  });
});
