import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindById = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => {
  return {
    MemberRepository: class {
      constructor() {}
      findById = mockFindById;
      update = mockUpdate;
    },
  };
});

import { getSessionContext } from "@/lib/auth/session";
import { GET, PUT } from "../route";

const mockGetSessionContext = vi.mocked(getSessionContext);

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost"), options);
}

const session = {
  user: { id: "user-1" },
  member: { id: "member-1", roles: ["member"], email: "test@test.com" },
  ensembleId: "ensemble-1",
};

describe("GET /api/profile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns own profile", async () => {
    mockGetSessionContext.mockResolvedValue(session as never);
    const member = { id: "member-1", name: "Test User" };
    mockFindById.mockResolvedValue(member);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(member);
    expect(mockFindById).toHaveBeenCalledWith("member-1");
  });
});

describe("PUT /api/profile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await PUT(
      makeRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(401);
  });

  it("updates own profile", async () => {
    mockGetSessionContext.mockResolvedValue(session as never);
    const updated = { id: "member-1", name: "Updated Name" };
    mockUpdate.mockResolvedValue(updated);

    const response = await PUT(
      makeRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: "Updated Name",
          email: "test@test.com",
        }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updated);
    expect(mockUpdate).toHaveBeenCalledWith("member-1", {
      name: "Updated Name",
      email: "test@test.com",
    });
  });
});
