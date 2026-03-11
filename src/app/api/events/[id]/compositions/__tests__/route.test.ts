import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindEventById = vi.fn();
const mockFindByEvent = vi.fn();
const mockFindCompositionById = vi.fn();
const mockLinkToEvent = vi.fn();
const mockUnlinkFromEvent = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  EventRepository: class {
    constructor() {}
    findById = mockFindEventById;
  },
  CompositionRepository: class {
    constructor() {}
    findByEvent = mockFindByEvent;
    findById = mockFindCompositionById;
    linkToEvent = mockLinkToEvent;
    unlinkFromEvent = mockUnlinkFromEvent;
  },
}));

import { getSessionContext } from "@/lib/auth/session";
import { GET, POST, DELETE } from "../route";

const mockGetSessionContext = vi.mocked(getSessionContext);

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost"), options);
}

const params = { params: Promise.resolve({ id: "event-1" }) };

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

describe("GET /api/events/[id]/compositions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await GET(
      makeRequest("http://localhost/api/events/event-1/compositions"),
      params
    );
    expect(response.status).toBe(401);
  });

  it("returns compositions for event", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindEventById.mockResolvedValue({ id: "event-1" });
    const compositions = [{ id: "c1", name: "Ave Maria" }];
    mockFindByEvent.mockResolvedValue(compositions);

    const response = await GET(
      makeRequest("http://localhost/api/events/event-1/compositions"),
      params
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(compositions);
  });
});

describe("POST /api/events/[id]/compositions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("links composition to event", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindEventById.mockResolvedValue({ id: "event-1" });
    mockFindCompositionById.mockResolvedValue({ id: "comp-1" });
    mockLinkToEvent.mockResolvedValue(undefined);

    const response = await POST(
      makeRequest("http://localhost/api/events/event-1/compositions", {
        method: "POST",
        body: JSON.stringify({ compositionId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" }),
        headers: { "Content-Type": "application/json" },
      }),
      params
    );
    expect(response.status).toBe(201);
  });

  it("returns 403 for member", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const response = await POST(
      makeRequest("http://localhost/api/events/event-1/compositions", {
        method: "POST",
        body: JSON.stringify({ compositionId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" }),
        headers: { "Content-Type": "application/json" },
      }),
      params
    );
    expect(response.status).toBe(403);
  });
});

describe("DELETE /api/events/[id]/compositions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unlinks composition from event", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockUnlinkFromEvent.mockResolvedValue(undefined);

    const response = await DELETE(
      makeRequest("http://localhost/api/events/event-1/compositions", {
        method: "DELETE",
        body: JSON.stringify({ compositionId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" }),
        headers: { "Content-Type": "application/json" },
      }),
      params
    );
    expect(response.status).toBe(200);
  });
});
