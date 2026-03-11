import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockSetRoles = vi.fn();
const mockFindById = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => {
  return {
    MemberRepository: class {
      constructor() {}
      setRoles = mockSetRoles;
      findById = mockFindById;
    },
  };
});

import { getSessionContext } from "@/lib/auth/session";
import { PUT } from "../route";

const mockGetSessionContext = vi.mocked(getSessionContext);

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost"), options);
}

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

const adminSession = {
  user: { id: "user-1" },
  member: { id: "member-1", roles: ["admin"] },
  ensembleId: "ensemble-1",
};

const memberSession = {
  user: { id: "user-2" },
  member: { id: "member-2", roles: ["member"] },
  ensembleId: "ensemble-1",
};

describe("PUT /api/members/[id]/roles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await PUT(
      makeRequest("http://localhost/api/members/m1/roles", {
        method: "PUT",
        body: JSON.stringify({ roles: ["member"] }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("m1")
    );
    expect(response.status).toBe(401);
  });

  it("returns 403 for non-admin", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const response = await PUT(
      makeRequest("http://localhost/api/members/m1/roles", {
        method: "PUT",
        body: JSON.stringify({ roles: ["admin"] }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("m1")
    );
    expect(response.status).toBe(403);
  });

  it("sets roles for another member", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockSetRoles.mockResolvedValue(undefined);
    const updatedMember = { id: "member-2", roles: ["director", "member"] };
    mockFindById.mockResolvedValue(updatedMember);

    const response = await PUT(
      makeRequest("http://localhost/api/members/member-2/roles", {
        method: "PUT",
        body: JSON.stringify({ roles: ["director", "member"] }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("member-2")
    );
    expect(response.status).toBe(200);
    expect(mockSetRoles).toHaveBeenCalledWith("member-2", ["director", "member"]);
  });

  it("prevents removing own admin role", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);

    const response = await PUT(
      makeRequest("http://localhost/api/members/member-1/roles", {
        method: "PUT",
        body: JSON.stringify({ roles: ["member"] }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("member-1")
    );
    expect(response.status).toBe(400);
    expect(mockSetRoles).not.toHaveBeenCalled();
  });
});
