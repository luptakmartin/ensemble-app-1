import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindByEvent = vi.fn();
const mockUpsert = vi.fn();
const mockFindById = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => {
  return {
    EventRepository: class {
      constructor() {}
      findById = mockFindById;
    },
    AttendanceRepository: class {
      constructor() {}
      findByEvent = mockFindByEvent;
      upsert = mockUpsert;
    },
  };
});

vi.mock("@/lib/utils/event-time", () => ({
  hasEventStarted: vi.fn(),
}));

import { getSessionContext } from "@/lib/auth/session";
import { hasEventStarted } from "@/lib/utils/event-time";
import { GET, PUT } from "../route";

const mockGetSessionContext = vi.mocked(getSessionContext);
const mockHasEventStarted = vi.mocked(hasEventStarted);

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost"), options);
}

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

const adminSession = {
  user: { id: "user-1" },
  member: { id: "member-1", roles: ["admin"] },
  ensembleId: "ensemble-1",
};

const directorSession = {
  user: { id: "user-3" },
  member: { id: "member-3", roles: ["director"] },
  ensembleId: "ensemble-1",
};

const memberSession = {
  user: { id: "user-2" },
  member: { id: "member-2", roles: ["member"] },
  ensembleId: "ensemble-1",
};

const mockEvent = {
  id: "event-1",
  name: "Test Event",
  date: "2026-04-01T00:00:00Z",
  time: "18:00",
};

describe("GET /api/events/[id]/attendance", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await GET(
      makeRequest("http://localhost/api/events/event-1/attendance"),
      makeParams("event-1")
    );
    expect(response.status).toBe(401);
  });

  it("returns 404 when event not found", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindById.mockResolvedValue(null);

    const response = await GET(
      makeRequest("http://localhost/api/events/event-1/attendance"),
      makeParams("event-1")
    );
    expect(response.status).toBe(404);
  });

  it("returns attendance list", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindById.mockResolvedValue(mockEvent);
    const attendanceList = [
      { memberId: "m1", status: "yes", memberName: "Alice" },
    ];
    mockFindByEvent.mockResolvedValue(attendanceList);

    const response = await GET(
      makeRequest("http://localhost/api/events/event-1/attendance"),
      makeParams("event-1")
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(attendanceList);
  });
});

describe("PUT /api/events/[id]/attendance", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 when member updates own status before event", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    mockFindById.mockResolvedValue(mockEvent);
    mockHasEventStarted.mockReturnValue(false);
    mockUpsert.mockResolvedValue({ memberId: "member-2", status: "yes" });

    const response = await PUT(
      makeRequest("http://localhost/api/events/event-1/attendance", {
        method: "PUT",
        body: JSON.stringify({ status: "yes" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("event-1")
    );
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith("event-1", "member-2", "yes");
  });

  it("returns 403 when member updates own status after event started", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    mockFindById.mockResolvedValue(mockEvent);
    mockHasEventStarted.mockReturnValue(true);

    const response = await PUT(
      makeRequest("http://localhost/api/events/event-1/attendance", {
        method: "PUT",
        body: JSON.stringify({ status: "yes" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("event-1")
    );
    expect(response.status).toBe(403);
  });

  it("returns 403 when member tries to update another member", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    mockFindById.mockResolvedValue(mockEvent);
    mockHasEventStarted.mockReturnValue(false);

    const response = await PUT(
      makeRequest("http://localhost/api/events/event-1/attendance", {
        method: "PUT",
        body: JSON.stringify({ status: "yes", memberId: "a0000000-0000-4000-a000-000000000099" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("event-1")
    );
    expect(response.status).toBe(403);
  });

  it("returns 200 when admin updates another member", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindById.mockResolvedValue(mockEvent);
    mockHasEventStarted.mockReturnValue(false);
    mockUpsert.mockResolvedValue({ memberId: "a0000000-0000-4000-a000-000000000099", status: "no" });

    const response = await PUT(
      makeRequest("http://localhost/api/events/event-1/attendance", {
        method: "PUT",
        body: JSON.stringify({ status: "no", memberId: "a0000000-0000-4000-a000-000000000099" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("event-1")
    );
    expect(response.status).toBe(200);
  });

  it("returns 200 when director updates own status after event started", async () => {
    mockGetSessionContext.mockResolvedValue(directorSession as never);
    mockFindById.mockResolvedValue(mockEvent);
    mockHasEventStarted.mockReturnValue(true);
    mockUpsert.mockResolvedValue({ memberId: "member-3", status: "yes" });

    const response = await PUT(
      makeRequest("http://localhost/api/events/event-1/attendance", {
        method: "PUT",
        body: JSON.stringify({ status: "yes" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("event-1")
    );
    expect(response.status).toBe(200);
  });

  it("returns 400 for invalid body", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);

    const response = await PUT(
      makeRequest("http://localhost/api/events/event-1/attendance", {
        method: "PUT",
        body: JSON.stringify({ status: "invalid" }),
        headers: { "Content-Type": "application/json" },
      }),
      makeParams("event-1")
    );
    expect(response.status).toBe(400);
  });
});
