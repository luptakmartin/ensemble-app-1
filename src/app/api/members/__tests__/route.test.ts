import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindAll = vi.fn();
const mockCreate = vi.fn();
const mockAddRole = vi.fn();
const mockInviteUser = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => {
  return {
    MemberRepository: class {
      constructor() {}
      findAll = mockFindAll;
      create = mockCreate;
      addRole = mockAddRole;
    },
  };
});

vi.mock("@/lib/services/auth", () => ({
  getAuthService: () => ({
    inviteUser: mockInviteUser,
  }),
}));

import { getSessionContext } from "@/lib/auth/session";
import { GET, POST } from "../route";

const mockGetSessionContext = vi.mocked(getSessionContext);

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost"), options);
}

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

describe("GET /api/members", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns all members", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const members = [{ id: "m1", name: "Alice" }];
    mockFindAll.mockResolvedValue(members);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(members);
  });
});

describe("POST /api/members", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await POST(
      makeRequest("http://localhost/api/members", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(401);
  });

  it("returns 403 for non-admin", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const response = await POST(
      makeRequest("http://localhost/api/members", {
        method: "POST",
        body: JSON.stringify({ email: "a@b.com", name: "Test", role: "member" }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(403);
  });

  it("creates member with invite", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockInviteUser.mockResolvedValue({ id: "auth-user-1", email: "new@test.com" });
    mockCreate.mockResolvedValue({ id: "new-member-1", name: "New Member", roles: [] });
    mockAddRole.mockResolvedValue(undefined);

    const response = await POST(
      makeRequest("http://localhost/api/members", {
        method: "POST",
        body: JSON.stringify({
          email: "new@test.com",
          name: "New Member",
          role: "member",
        }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.temporaryPassword).toBeDefined();
    expect(mockInviteUser).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalled();
    expect(mockAddRole).toHaveBeenCalledWith("new-member-1", "member");
  });

  it("returns 400 for invalid body", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const response = await POST(
      makeRequest("http://localhost/api/members", {
        method: "POST",
        body: JSON.stringify({ email: "not-an-email" }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(400);
  });
});
