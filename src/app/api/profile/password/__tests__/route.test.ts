import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockSignIn = vi.fn();
const mockUpdatePassword = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSessionContext: vi.fn(),
}));

vi.mock("@/lib/services/auth", () => ({
  getAuthService: () => ({
    signIn: mockSignIn,
    updatePassword: mockUpdatePassword,
  }),
}));

import { getSessionContext } from "@/lib/auth/session";
import { PUT } from "../route";

const mockGetSessionContext = vi.mocked(getSessionContext);

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost"), options);
}

const session = {
  user: { id: "user-1" },
  member: { id: "member-1", roles: ["member"], email: "test@test.com" },
  ensembleId: "ensemble-1",
};

describe("PUT /api/profile/password", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSessionContext.mockResolvedValue(null);
    const response = await PUT(
      makeRequest("http://localhost/api/profile/password", {
        method: "PUT",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(401);
  });

  it("changes password successfully", async () => {
    mockGetSessionContext.mockResolvedValue(session as never);
    mockSignIn.mockResolvedValue({ user: { id: "user-1" } });
    mockUpdatePassword.mockResolvedValue(undefined);

    const response = await PUT(
      makeRequest("http://localhost/api/profile/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: "oldPassword",
          newPassword: "newPassword123",
        }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(200);
    expect(mockSignIn).toHaveBeenCalledWith("test@test.com", "oldPassword");
    expect(mockUpdatePassword).toHaveBeenCalledWith("newPassword123");
  });

  it("returns 400 for wrong current password", async () => {
    mockGetSessionContext.mockResolvedValue(session as never);
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"));

    const response = await PUT(
      makeRequest("http://localhost/api/profile/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: "wrongPassword",
          newPassword: "newPassword123",
        }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(response.status).toBe(400);
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });
});
