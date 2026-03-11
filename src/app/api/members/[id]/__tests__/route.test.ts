import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindById = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => {
  return {
    MemberRepository: class {
      constructor() {}
      findById = mockFindById;
      update = mockUpdate;
      delete = mockDelete;
    },
  };
});

import { getSessionContext } from "@/lib/auth/session";
import { GET, PUT, DELETE } from "../route";

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

const directorSession = {
  user: { id: "user-3" },
  member: { id: "member-3", roles: ["director"] },
  ensembleId: "ensemble-1",
};

describe("GET /api/members/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await GET(
      makeRequest("http://localhost/api/members/m1"),
      makeParams("m1")
    );
    expect(response.status).toBe(401);
  });

  it("returns member by ID", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const member = { id: "m1", name: "Alice" };
    mockFindById.mockResolvedValue(member);

    const response = await GET(
      makeRequest("http://localhost/api/members/m1"),
      makeParams("m1")
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(member);
  });

  it("returns 404 for nonexistent member", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindById.mockResolvedValue(null);

    const response = await GET(
      makeRequest("http://localhost/api/members/missing"),
      makeParams("missing")
    );
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/members/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("admin can update any member", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const updated = { id: "member-2", name: "Updated" };
    mockUpdate.mockResolvedValue(updated);

    const response = await PUT(
      makeRequest("http://localhost/api/members/member-2", {
        method: "PUT",
        body: JSON.stringify({ name: "Updated" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("member-2")
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updated);
  });

  it("member can update self", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const updated = { id: "member-2", name: "My New Name" };
    mockUpdate.mockResolvedValue(updated);

    const response = await PUT(
      makeRequest("http://localhost/api/members/member-2", {
        method: "PUT",
        body: JSON.stringify({ name: "My New Name" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("member-2")
    );
    expect(response.status).toBe(200);
  });

  it("member cannot update others", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);

    const response = await PUT(
      makeRequest("http://localhost/api/members/member-1", {
        method: "PUT",
        body: JSON.stringify({ name: "Hacked" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("member-1")
    );
    expect(response.status).toBe(403);
  });

  it("director can update voiceGroup of others", async () => {
    mockGetSessionContext.mockResolvedValue(directorSession as never);
    const updated = { id: "member-2", voiceGroup: "S" };
    mockUpdate.mockResolvedValue(updated);

    const response = await PUT(
      makeRequest("http://localhost/api/members/member-2", {
        method: "PUT",
        body: JSON.stringify({ voiceGroup: "S" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("member-2")
    );
    expect(response.status).toBe(200);
    // Director should only pass voiceGroup, not other fields
    expect(mockUpdate).toHaveBeenCalledWith("member-2", { voiceGroup: "S" });
  });
});

describe("DELETE /api/members/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("admin can delete other members", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockDelete.mockResolvedValue(undefined);

    const response = await DELETE(
      makeRequest("http://localhost/api/members/member-2", { method: "DELETE" }),
      makeParams("member-2")
    );
    expect(response.status).toBe(200);
  });

  it("admin cannot delete self", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);

    const response = await DELETE(
      makeRequest("http://localhost/api/members/member-1", { method: "DELETE" }),
      makeParams("member-1")
    );
    expect(response.status).toBe(400);
  });

  it("non-admin cannot delete members", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);

    const response = await DELETE(
      makeRequest("http://localhost/api/members/member-1", { method: "DELETE" }),
      makeParams("member-1")
    );
    expect(response.status).toBe(403);
  });
});
