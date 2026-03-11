import { describe, it, expect, vi } from "vitest";
import { SupabaseStorageService } from "../supabase-storage-service";

function createMockSupabase(overrides: Record<string, unknown> = {}) {
  return {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "https://storage.example.com/bucket/file.pdf" },
        }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        ...overrides,
      })),
    },
  };
}

describe("SupabaseStorageService", () => {
  it("uploads a file and returns path and url", async () => {
    const supabase = createMockSupabase();
    const service = new SupabaseStorageService(supabase as never);

    const result = await service.upload("attachments", "path/file.pdf", new Blob());
    expect(result.path).toBe("path/file.pdf");
    expect(result.url).toBe("https://storage.example.com/bucket/file.pdf");
    expect(supabase.storage.from).toHaveBeenCalledWith("attachments");
  });

  it("returns public URL synchronously", () => {
    const supabase = createMockSupabase();
    const service = new SupabaseStorageService(supabase as never);

    const url = service.getPublicUrl("attachments", "path/file.pdf");
    expect(url).toBe("https://storage.example.com/bucket/file.pdf");
  });

  it("deletes files from storage", async () => {
    const supabase = createMockSupabase();
    const service = new SupabaseStorageService(supabase as never);

    await service.delete("attachments", ["path/file.pdf"]);
    expect(supabase.storage.from).toHaveBeenCalledWith("attachments");
  });

  it("throws on upload error", async () => {
    const supabase = createMockSupabase({
      upload: vi.fn().mockResolvedValue({ error: { message: "Upload failed" } }),
    });
    const service = new SupabaseStorageService(supabase as never);

    await expect(
      service.upload("attachments", "path/file.pdf", new Blob())
    ).rejects.toThrow("Storage upload failed: Upload failed");
  });
});
