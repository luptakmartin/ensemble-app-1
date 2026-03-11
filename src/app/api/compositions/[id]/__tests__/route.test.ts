import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindById = vi.fn();
const mockFindLinkedToAnyEvent = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  CompositionRepository: class {
    constructor() {}
    findById = mockFindById;
    findLinkedToAnyEvent = mockFindLinkedToAnyEvent;
    update = mockUpdate;
    delete = mockDelete;
  },
}));

import { getSessionContext } from "@/lib/auth/session";
import { GET, PUT, DELETE } from "../route";

const mockGetSessionContext = vi.mocked(getSessionContext);

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost"), options);
}

const params = { params: Promise.resolve({ id: "comp-1" }) };

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

describe("GET /api/compositions/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await GET(
      makeRequest("http://localhost/api/compositions/comp-1"),
      params
    );
    expect(response.status).toBe(401);
  });

  it("returns 404 when not found", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindById.mockResolvedValue(null);
    const response = await GET(
      makeRequest("http://localhost/api/compositions/comp-1"),
      params
    );
    expect(response.status).toBe(404);
  });

  it("returns composition for admin", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const comp = { id: "comp-1", name: "Ave Maria" };
    mockFindById.mockResolvedValue(comp);
    const response = await GET(
      makeRequest("http://localhost/api/compositions/comp-1"),
      params
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(comp);
  });
});

describe("PUT /api/compositions/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates composition for admin", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const updated = { id: "comp-1", name: "Updated" };
    mockUpdate.mockResolvedValue(updated);
    const response = await PUT(
      makeRequest("http://localhost/api/compositions/comp-1", {
        method: "PUT",
        body: JSON.stringify({ name: "Updated" }),
        headers: { "Content-Type": "application/json" },
      }),
      params
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updated);
  });

  it("returns 403 for member", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const response = await PUT(
      makeRequest("http://localhost/api/compositions/comp-1", {
        method: "PUT",
        body: JSON.stringify({ name: "X" }),
        headers: { "Content-Type": "application/json" },
      }),
      params
    );
    expect(response.status).toBe(403);
  });
});

describe("DELETE /api/compositions/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes composition for admin", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockDelete.mockResolvedValue(undefined);
    const response = await DELETE(
      makeRequest("http://localhost/api/compositions/comp-1"),
      params
    );
    expect(response.status).toBe(200);
  });

  it("returns 403 for member", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const response = await DELETE(
      makeRequest("http://localhost/api/compositions/comp-1"),
      params
    );
    expect(response.status).toBe(403);
  });
});
