import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindUpcoming = vi.fn();
const mockFindPast = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => {
  return {
    EventRepository: class {
      constructor() {}
      findUpcoming = mockFindUpcoming;
      findPast = mockFindPast;
      create = mockCreate;
    },
  };
});

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

describe("GET /api/events", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await GET(makeRequest("http://localhost/api/events"));
    expect(response.status).toBe(401);
  });

  it("returns upcoming events by default", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const events = [{ id: "1", name: "Event 1" }];
    mockFindUpcoming.mockResolvedValue(events);

    const response = await GET(makeRequest("http://localhost/api/events"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(events);
    expect(mockFindUpcoming).toHaveBeenCalled();
  });

  it("returns past events when filter=past", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const events = [{ id: "2", name: "Past Event" }];
    mockFindPast.mockResolvedValue(events);

    const response = await GET(
      makeRequest("http://localhost/api/events?filter=past")
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(events);
    expect(mockFindPast).toHaveBeenCalled();
  });
});

describe("POST /api/events", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates event for admin/director", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    const newEvent = { id: "new-1", name: "New Event" };
    mockCreate.mockResolvedValue(newEvent);

    const body = {
      name: "New Event",
      type: "concert",
      date: "2026-04-01T18:00:00.000Z",
      time: "18:00",
      place: "Hall",
    };

    const response = await POST(
      makeRequest("http://localhost/api/events", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(newEvent);
  });

  it("returns 403 for member role", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const response = await POST(
      makeRequest("http://localhost/api/events", {
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
      makeRequest("http://localhost/api/events", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(400);
  });
});
