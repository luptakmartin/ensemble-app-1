import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindById = vi.fn();
const mockFindByComposition = vi.fn();
const mockCreateAttachment = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  CompositionRepository: class {
    constructor() {}
    findById = mockFindById;
  },
  AttachmentRepository: class {
    constructor() {}
    findByComposition = mockFindByComposition;
    create = mockCreateAttachment;
  },
}));

vi.mock("@/lib/services/storage", () => ({
  getStorageService: vi.fn(),
}));

import { getSessionContext } from "@/lib/auth/session";
import { GET, POST } from "../route";

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

describe("GET /api/compositions/[id]/attachments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await GET(
      makeRequest("http://localhost/api/compositions/comp-1/attachments"),
      params
    );
    expect(response.status).toBe(401);
  });

  it("returns 404 when composition not found", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindById.mockResolvedValue(null);
    const response = await GET(
      makeRequest("http://localhost/api/compositions/comp-1/attachments"),
      params
    );
    expect(response.status).toBe(404);
  });

  it("returns attachments for composition", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindById.mockResolvedValue({ id: "comp-1" });
    const attachments = [{ id: "a1", name: "sheet.pdf" }];
    mockFindByComposition.mockResolvedValue(attachments);

    const response = await GET(
      makeRequest("http://localhost/api/compositions/comp-1/attachments"),
      params
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(attachments);
  });
});

describe("POST /api/compositions/[id]/attachments (link mode)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates link attachment", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindById.mockResolvedValue({ id: "comp-1" });
    const attachment = { id: "a1", name: "Sheet Music", isLink: true };
    mockCreateAttachment.mockResolvedValue(attachment);

    const response = await POST(
      makeRequest("http://localhost/api/compositions/comp-1/attachments", {
        method: "POST",
        body: JSON.stringify({
          name: "Sheet Music",
          url: "https://example.com/sheet.pdf",
          type: "sheet",
          isLink: true,
        }),
        headers: { "Content-Type": "application/json" },
      }),
      params
    );
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(attachment);
  });
});
