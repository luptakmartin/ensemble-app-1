import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindCompositionById = vi.fn();
const mockFindAttachmentById = vi.fn();
const mockDeleteAttachment = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

const mockUpdateAttachment = vi.fn();

vi.mock("@/lib/db/repositories", () => ({
  CompositionRepository: class {
    constructor() {}
    findById = mockFindCompositionById;
  },
  AttachmentRepository: class {
    constructor() {}
    findById = mockFindAttachmentById;
    delete = mockDeleteAttachment;
    update = mockUpdateAttachment;
  },
}));

vi.mock("@/lib/services/storage", () => ({
  getStorageService: vi.fn().mockResolvedValue({
    delete: vi.fn().mockResolvedValue(undefined),
  }),
}));

import { getSessionContext } from "@/lib/auth/session";
import { DELETE, PATCH } from "../route";

const mockGetSessionContext = vi.mocked(getSessionContext);

function makeRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost"));
}

const params = {
  params: Promise.resolve({ id: "comp-1", attachmentId: "att-1" }),
};

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

describe("DELETE /api/compositions/[id]/attachments/[attachmentId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes attachment for admin", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindCompositionById.mockResolvedValue({ id: "comp-1" });
    mockFindAttachmentById.mockResolvedValue({
      id: "att-1",
      compositionId: "comp-1",
      isLink: true,
    });
    mockDeleteAttachment.mockResolvedValue({ id: "att-1" });

    const response = await DELETE(
      makeRequest("http://localhost/api/compositions/comp-1/attachments/att-1"),
      params
    );
    expect(response.status).toBe(200);
  });

  it("returns 403 for member", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const response = await DELETE(
      makeRequest("http://localhost/api/compositions/comp-1/attachments/att-1"),
      params
    );
    expect(response.status).toBe(403);
  });
});

describe("PATCH /api/compositions/[id]/attachments/[attachmentId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates attachment for admin", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindCompositionById.mockResolvedValue({ id: "comp-1" });
    mockFindAttachmentById.mockResolvedValue({
      id: "att-1",
      compositionId: "comp-1",
      isLink: true,
    });
    const updated = { id: "att-1", name: "New Name", type: "audio" };
    mockUpdateAttachment.mockResolvedValue(updated);

    const request = new NextRequest(
      new URL("http://localhost/api/compositions/comp-1/attachments/att-1"),
      {
        method: "PATCH",
        body: JSON.stringify({ name: "New Name", type: "audio" }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await PATCH(request, params);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.name).toBe("New Name");
  });

  it("returns 403 for member", async () => {
    mockGetSessionContext.mockResolvedValue(memberSession as never);
    const request = new NextRequest(
      new URL("http://localhost/api/compositions/comp-1/attachments/att-1"),
      {
        method: "PATCH",
        body: JSON.stringify({ name: "New Name", type: "audio" }),
        headers: { "Content-Type": "application/json" },
      }
    );
    const response = await PATCH(request, params);
    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid data", async () => {
    mockGetSessionContext.mockResolvedValue(adminSession as never);
    mockFindCompositionById.mockResolvedValue({ id: "comp-1" });
    mockFindAttachmentById.mockResolvedValue({
      id: "att-1",
      compositionId: "comp-1",
    });

    const request = new NextRequest(
      new URL("http://localhost/api/compositions/comp-1/attachments/att-1"),
      {
        method: "PATCH",
        body: JSON.stringify({ name: "", type: "invalid" }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await PATCH(request, params);
    expect(response.status).toBe(400);
  });
});
