import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/drizzle", () => {
  const returningMock = vi.fn();
  const groupByMock = vi.fn(() => Promise.resolve([]));
  const orderByMock = vi.fn(() => Promise.resolve([]));
  const selectWhereMock = vi.fn(() => ({ orderBy: orderByMock, groupBy: groupByMock }));
  const fromMock = vi.fn(() => ({ where: selectWhereMock }));
  const selectMock = vi.fn(() => ({ from: fromMock }));
  const valuesMock = vi.fn(() => ({ returning: returningMock }));
  const insertMock = vi.fn(() => ({ values: valuesMock }));
  const deleteWhereMock = vi.fn(() => ({ returning: returningMock }));
  const deleteMock = vi.fn(() => ({ where: deleteWhereMock }));
  const updateSetMock = vi.fn(() => ({ where: vi.fn(() => ({ returning: returningMock })) }));
  const updateMock = vi.fn(() => ({ set: updateSetMock }));

  return {
    db: {
      select: selectMock,
      insert: insertMock,
      delete: deleteMock,
      update: updateMock,
      _mocks: {
        selectMock,
        fromMock,
        selectWhereMock,
        groupByMock,
        orderByMock,
        insertMock,
        valuesMock,
        returningMock,
        deleteMock,
        deleteWhereMock,
        updateMock,
        updateSetMock,
      },
    },
  };
});

import { db } from "@/lib/db/drizzle";
import { AttachmentRepository } from "../attachment-repository";

const mocks = (db as unknown as { _mocks: Record<string, ReturnType<typeof vi.fn>> })._mocks;

describe("AttachmentRepository", () => {
  let repo: AttachmentRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new AttachmentRepository();
  });

  describe("countByCompositionIds", () => {
    it("returns empty object for empty input", async () => {
      const result = await repo.countByCompositionIds([]);
      expect(result).toEqual({});
    });

    it("returns counts grouped by compositionId", async () => {
      mocks.groupByMock.mockResolvedValue([
        { compositionId: "c1", count: 3 },
        { compositionId: "c2", count: 1 },
      ]);
      const result = await repo.countByCompositionIds(["c1", "c2"]);
      expect(result).toEqual({ c1: 3, c2: 1 });
    });
  });

  describe("findByComposition", () => {
    it("returns attachments ordered by type and name", async () => {
      const attachments = [{ id: "a1", name: "sheet.pdf" }];
      mocks.orderByMock.mockResolvedValue(attachments);
      const result = await repo.findByComposition("c1");
      expect(result).toEqual(attachments);
    });
  });

  describe("findById", () => {
    it("returns null when not found", async () => {
      mocks.selectWhereMock.mockResolvedValue([]);
      const result = await repo.findById("a1");
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("inserts and returns attachment", async () => {
      const attachment = { id: "a1", name: "sheet.pdf" };
      mocks.returningMock.mockResolvedValue([attachment]);
      const result = await repo.create({
        compositionId: "c1",
        type: "sheet",
        name: "sheet.pdf",
        url: "https://example.com/sheet.pdf",
        isLink: true,
      });
      expect(result).toEqual(attachment);
    });
  });

  describe("update", () => {
    it("updates and returns updated row", async () => {
      const updated = { id: "a1", name: "renamed.pdf", type: "audio" };
      mocks.returningMock.mockResolvedValue([updated]);
      const result = await repo.update("a1", { name: "renamed.pdf", type: "audio" });
      expect(result).toEqual(updated);
    });

    it("returns null when not found", async () => {
      mocks.returningMock.mockResolvedValue([]);
      const result = await repo.update("nonexistent", { name: "test" });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deletes and returns deleted row", async () => {
      const deleted = { id: "a1", name: "sheet.pdf" };
      mocks.returningMock.mockResolvedValue([deleted]);
      const result = await repo.delete("a1");
      expect(result).toEqual(deleted);
    });
  });
});
