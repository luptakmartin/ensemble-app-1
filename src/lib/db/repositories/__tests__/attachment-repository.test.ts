import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/drizzle", () => {
  const returningMock = vi.fn();
  const orderByMock = vi.fn(() => Promise.resolve([]));
  const selectWhereMock = vi.fn(() => ({ orderBy: orderByMock }));
  const fromMock = vi.fn(() => ({ where: selectWhereMock }));
  const selectMock = vi.fn(() => ({ from: fromMock }));
  const valuesMock = vi.fn(() => ({ returning: returningMock }));
  const insertMock = vi.fn(() => ({ values: valuesMock }));
  const deleteWhereMock = vi.fn(() => ({ returning: returningMock }));
  const deleteMock = vi.fn(() => ({ where: deleteWhereMock }));

  return {
    db: {
      select: selectMock,
      insert: insertMock,
      delete: deleteMock,
      _mocks: {
        selectMock,
        fromMock,
        selectWhereMock,
        orderByMock,
        insertMock,
        valuesMock,
        returningMock,
        deleteMock,
        deleteWhereMock,
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

  describe("delete", () => {
    it("deletes and returns deleted row", async () => {
      const deleted = { id: "a1", name: "sheet.pdf" };
      mocks.returningMock.mockResolvedValue([deleted]);
      const result = await repo.delete("a1");
      expect(result).toEqual(deleted);
    });
  });
});
