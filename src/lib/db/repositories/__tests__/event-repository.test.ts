import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the drizzle db module before importing the repository
vi.mock("@/lib/db/drizzle", () => {
  const returningMock = vi.fn();
  const whereMock = vi.fn(() => ({ returning: returningMock }));
  const setMock = vi.fn(() => ({ where: whereMock }));
  const valuesMock = vi.fn(() => ({ returning: returningMock }));
  const orderByMock = vi.fn(() => Promise.resolve([]));
  const selectWhereMock = vi.fn(() => ({ orderBy: orderByMock }));
  const fromMock = vi.fn(() => ({
    where: selectWhereMock,
  }));
  const selectMock = vi.fn(() => ({ from: fromMock }));
  const insertMock = vi.fn(() => ({ values: valuesMock }));
  const updateMock = vi.fn(() => ({ set: setMock }));
  const deleteWhereMock = vi.fn(() => Promise.resolve());
  const deleteMock = vi.fn(() => ({ where: deleteWhereMock }));

  return {
    db: {
      select: selectMock,
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
      _mocks: {
        selectMock,
        fromMock,
        selectWhereMock,
        orderByMock,
        insertMock,
        valuesMock,
        returningMock,
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
import { EventRepository } from "../event-repository";

const mocks = (db as unknown as { _mocks: Record<string, ReturnType<typeof vi.fn>> })._mocks;

describe("EventRepository", () => {
  const ensembleId = "ensemble-123";
  let repo: EventRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new EventRepository(ensembleId);
  });

  describe("findUpcoming", () => {
    it("calls select with correct filters and orders ascending", async () => {
      mocks.orderByMock.mockResolvedValue([]);
      const result = await repo.findUpcoming();
      expect(result).toEqual([]);
      expect(mocks.selectMock).toHaveBeenCalled();
      expect(mocks.selectWhereMock).toHaveBeenCalled();
      expect(mocks.orderByMock).toHaveBeenCalled();
    });
  });

  describe("findPast", () => {
    it("calls select with correct filters and orders descending", async () => {
      mocks.orderByMock.mockResolvedValue([]);
      const result = await repo.findPast();
      expect(result).toEqual([]);
      expect(mocks.selectMock).toHaveBeenCalled();
      expect(mocks.selectWhereMock).toHaveBeenCalled();
      expect(mocks.orderByMock).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("filters by both id and ensembleId", async () => {
      mocks.selectWhereMock.mockResolvedValue([]);
      const result = await repo.findById("event-1");
      expect(result).toBeNull();
      expect(mocks.selectWhereMock).toHaveBeenCalled();
    });

    it("returns event when found", async () => {
      const event = { id: "event-1", name: "Test Event" };
      mocks.selectWhereMock.mockResolvedValue([event]);
      const result = await repo.findById("event-1");
      expect(result).toEqual(event);
    });
  });

  describe("create", () => {
    it("inserts with ensembleId from constructor", async () => {
      const newEvent = { id: "event-1", name: "New Event" };
      mocks.returningMock.mockResolvedValue([newEvent]);
      const result = await repo.create({
        name: "New Event",
        type: "concert",
        date: "2026-04-01T18:00:00.000Z",
        time: "18:00",
        place: "Concert Hall",
      });
      expect(result).toEqual(newEvent);
      expect(mocks.insertMock).toHaveBeenCalled();
      expect(mocks.valuesMock).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("sets updatedAt and filters by id + ensembleId", async () => {
      const updated = { id: "event-1", name: "Updated" };
      mocks.returningMock.mockResolvedValue([updated]);
      const result = await repo.update("event-1", { name: "Updated" });
      expect(result).toEqual(updated);
      expect(mocks.setMock).toHaveBeenCalled();
    });

    it("throws when event not found", async () => {
      mocks.returningMock.mockResolvedValue([]);
      await expect(repo.update("missing", { name: "X" })).rejects.toThrow(
        "Event missing not found"
      );
    });
  });

  describe("delete", () => {
    it("filters by id + ensembleId", async () => {
      await repo.delete("event-1");
      expect(mocks.deleteMock).toHaveBeenCalled();
      expect(mocks.deleteWhereMock).toHaveBeenCalled();
    });
  });
});
