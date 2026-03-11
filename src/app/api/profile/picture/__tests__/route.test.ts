import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockUpdate = vi.fn();
const mockUpload = vi.fn();
const mockDeleteStorage = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => {
  return {
    MemberRepository: class {
      constructor() {}
      update = mockUpdate;
    },
  };
});

vi.mock("@/lib/services/storage", () => ({
  getStorageService: () =>
    Promise.resolve({
      upload: mockUpload,
      delete: mockDeleteStorage,
    }),
}));

import { getSessionContext } from "@/lib/auth/session";
import { PUT } from "../route";

const mockGetSessionContext = vi.mocked(getSessionContext);

const session = {
  user: { id: "user-1" },
  member: {
    id: "member-1",
    roles: ["member"],
    profilePicture: null,
  },
  ensembleId: "ensemble-1",
};

function createMockRequest(file?: File | null) {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  const request = new NextRequest("http://localhost/api/profile/picture", {
    method: "PUT",
  });
  // Override formData() to avoid multipart parsing issues in tests
  vi.spyOn(request, "formData").mockResolvedValue(formData);
  return request;
}

describe("PUT /api/profile/picture", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await PUT(createMockRequest());
    expect(response.status).toBe(401);
  });

  it("uploads profile picture", async () => {
    mockGetSessionContext.mockResolvedValue(session as never);
    mockUpload.mockResolvedValue({
      path: "avatars/test",
      url: "https://example.com/avatar.jpg",
    });
    mockUpdate.mockResolvedValue({
      id: "member-1",
      profilePicture: "https://example.com/avatar.jpg",
    });

    const file = new File(["test-content"], "avatar.jpg", {
      type: "image/jpeg",
    });
    const response = await PUT(createMockRequest(file));
    expect(response.status).toBe(200);
    expect(mockUpload).toHaveBeenCalled();
  });

  it("returns 400 when no file provided", async () => {
    mockGetSessionContext.mockResolvedValue(session as never);
    const response = await PUT(createMockRequest());
    expect(response.status).toBe(400);
  });
});
