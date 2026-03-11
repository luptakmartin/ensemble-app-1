import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindAll = vi.fn();
const mockFindLinkedToAnyEvent = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  CompositionRepository: class {
    constructor() {}
    findAll = mockFindAll;
    findLinkedToAnyEvent = mockFindLinkedToAnyEvent;
    create = mockCreate;
  },
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

describe("GET /api/compositions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns all compositions for admin/director", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const compositions = [{ id: "c1", name: "Ave Maria" }];
    mockFindAll.mockResolvedValue(compositions);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(compositions);
    expect(mockFindAll).toHaveBeenCalled();
  });

  it("returns only linked compositions for member", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const compositions = [{ id: "c1", name: "Ave Maria" }];
    mockFindLinkedToAnyEvent.mockResolvedValue(compositions);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(compositions);
    expect(mockFindLinkedToAnyEvent).toHaveBeenCalled();
  });
});

describe("POST /api/compositions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates composition for admin", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const newComp = { id: "c1", name: "Ave Maria" };
    mockCreate.mockResolvedValue(newComp);

    const response = await POST(
      makeRequest("http://localhost/api/compositions", {
        method: "POST",
        body: JSON.stringify({ name: "Ave Maria", author: "Bach" }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(newComp);
  });

  it("returns 403 for member", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const response = await POST(
      makeRequest("http://localhost/api/compositions", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid body", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const response = await POST(
      makeRequest("http://localhost/api/compositions", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(400);
  });
});
