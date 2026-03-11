import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/drizzle", () => {
  const returningMock = vi.fn();
  const onConflictDoNothingMock = vi.fn();
  const whereMock = vi.fn(() => ({ returning: returningMock }));
  const setMock = vi.fn(() => ({ where: whereMock }));
  const valuesMock = vi.fn(() => ({
    returning: returningMock,
    onConflictDoNothing: onConflictDoNothingMock,
  }));
  const orderByMock = vi.fn(() => Promise.resolve([]));
  const selectWhereMock = vi.fn(() => ({ orderBy: orderByMock }));
  const innerJoinWhereMock = vi.fn(() => ({ orderBy: orderByMock }));
  const innerJoinMock = vi.fn(() => ({ where: innerJoinWhereMock }));
  const fromMock = vi.fn(() => ({
    where: selectWhereMock,
    innerJoin: innerJoinMock,
  }));
  const selectMock = vi.fn(() => ({ from: fromMock }));
  const selectDistinctMock = vi.fn(() => ({ from: fromMock }));
  const insertMock = vi.fn(() => ({ values: valuesMock }));
  const updateMock = vi.fn(() => ({ set: setMock }));
  const deleteWhereMock = vi.fn(() => Promise.resolve());
  const deleteMock = vi.fn(() => ({ where: deleteWhereMock }));

  return {
    db: {
      select: selectMock,
      selectDistinct: selectDistinctMock,
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
      _mocks: {
        selectMock,
        fromMock,
        selectWhereMock,
        orderByMock,
        innerJoinMock,
        insertMock,
        valuesMock,
        returningMock,
        onConflictDoNothingMock,
        updateMock,
        setMock,
        whereMock,
        deleteMock,
        deleteWhereMock,
      },
    },
  };
});

import { db } from "@/lib/db/drizzle";
import { CompositionRepository } from "../composition-repository";

const mocks = (db as unknown as { _mocks: Record<string, ReturnType<typeof vi.fn>> })._mocks;

describe("CompositionRepository", () => {
  const ensembleId = "ensemble-123";
  let repo: CompositionRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new CompositionRepository(ensembleId);
  });

  describe("findAll", () => {
    it("returns compositions ordered by name", async () => {
      const compositions = [{ id: "c1", name: "Ave Maria" }];
      mocks.orderByMock.mockResolvedValue(compositions);
      const result = await repo.findAll();
      expect(result).toEqual(compositions);
      expect(mocks.selectMock).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("returns null when not found", async () => {
      mocks.selectWhereMock.mockResolvedValue([]);
      const result = await repo.findById("c1");
      expect(result).toBeNull();
    });

    it("returns composition when found", async () => {
      const composition = { id: "c1", name: "Ave Maria" };
      mocks.selectWhereMock.mockResolvedValue([composition]);
      const result = await repo.findById("c1");
      expect(result).toEqual(composition);
    });
  });

  describe("findByEvent", () => {
    it("returns compositions linked to event", async () => {
      const compositions = [{ id: "c1", name: "Ave Maria" }];
      mocks.orderByMock.mockResolvedValue(compositions);
      const result = await repo.findByEvent("event-1");
      expect(result).toEqual(compositions);
      expect(mocks.innerJoinMock).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("inserts with ensembleId", async () => {
      const newComp = { id: "c1", name: "New Composition" };
      mocks.returningMock.mockResolvedValue([newComp]);
      const result = await repo.create({ name: "New Composition", author: "Bach" });
      expect(result).toEqual(newComp);
      expect(mocks.insertMock).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("updates and returns composition", async () => {
      const updated = { id: "c1", name: "Updated" };
      mocks.returningMock.mockResolvedValue([updated]);
      const result = await repo.update("c1", { name: "Updated" });
      expect(result).toEqual(updated);
      expect(mocks.setMock).toHaveBeenCalled();
    });

    it("throws when not found", async () => {
      mocks.returningMock.mockResolvedValue([]);
      await expect(repo.update("missing", { name: "X" })).rejects.toThrow(
        "Composition missing not found"
      );
    });
  });

  describe("delete", () => {
    it("deletes by id and ensembleId", async () => {
      await repo.delete("c1");
      expect(mocks.deleteMock).toHaveBeenCalled();
      expect(mocks.deleteWhereMock).toHaveBeenCalled();
    });
  });

  describe("linkToEvent", () => {
    it("inserts into eventCompositions with onConflictDoNothing", async () => {
      mocks.onConflictDoNothingMock.mockResolvedValue(undefined);
      await repo.linkToEvent("c1", "e1");
      expect(mocks.insertMock).toHaveBeenCalled();
      expect(mocks.onConflictDoNothingMock).toHaveBeenCalled();
    });
  });

  describe("unlinkFromEvent", () => {
    it("deletes from eventCompositions", async () => {
      await repo.unlinkFromEvent("c1", "e1");
      expect(mocks.deleteMock).toHaveBeenCalled();
      expect(mocks.deleteWhereMock).toHaveBeenCalled();
    });
  });
});
