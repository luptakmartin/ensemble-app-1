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
    EventRepository: class {
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

describe("GET /api/events/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns event by ID", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const event = { id: "event-1", name: "Test" };
    mockFindById.mockResolvedValue(event);

    const response = await GET(
      makeRequest("http://localhost/api/events/event-1"),
      makeParams("event-1")
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(event);
  });

  it("returns 404 for nonexistent event", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindById.mockResolvedValue(null);

    const response = await GET(
      makeRequest("http://localhost/api/events/missing"),
      makeParams("missing")
    );
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/events/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates event for admin/director", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const updated = { id: "event-1", name: "Updated" };
    mockUpdate.mockResolvedValue(updated);

    const response = await PUT(
      makeRequest("http://localhost/api/events/event-1", {
        method: "PUT",
        body: JSON.stringify({ name: "Updated" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("event-1")
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updated);
  });

  it("returns 403 for member role", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const response = await PUT(
      makeRequest("http://localhost/api/events/event-1", {
        method: "PUT",
        body: JSON.stringify({ name: "X" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("event-1")
    );
    expect(response.status).toBe(403);
  });
});

describe("DELETE /api/events/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes event for admin/director", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockDelete.mockResolvedValue(undefined);

    const response = await DELETE(
      makeRequest("http://localhost/api/events/event-1", { method: "DELETE" }),
      makeParams("event-1")
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });

  it("returns 403 for member role", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const response = await DELETE(
      makeRequest("http://localhost/api/events/event-1", { method: "DELETE" }),
      makeParams("event-1")
    );
    expect(response.status).toBe(403);
  });
});
