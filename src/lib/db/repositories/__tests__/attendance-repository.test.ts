import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFns = {
  select: vi.fn(),
  from: vi.fn(),
  innerJoin: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
  onConflictDoUpdate: vi.fn(),
  onConflictDoNothing: vi.fn(),
  returning: vi.fn(),
};

let selectWhereResult: unknown[] = [];
let insertResult: unknown[] = [];

vi.mock("@/lib/db/drizzle", () => {
  const self: Record<string, unknown> = {};
  self.select = (...args: unknown[]) => { mockFns.select(...args); return self; };
  self.from = (...args: unknown[]) => { mockFns.from(...args); return self; };
  self.innerJoin = (...args: unknown[]) => { mockFns.innerJoin(...args); return self; };
  self.where = (...args: unknown[]) => { mockFns.where(...args); return Object.assign(selectWhereResult, { orderBy: (...oArgs: unknown[]) => { mockFns.orderBy(...oArgs); return selectWhereResult; } }); };
  self.orderBy = (...args: unknown[]) => { mockFns.orderBy(...args); return selectWhereResult; };
  self.insert = (...args: unknown[]) => { mockFns.insert(...args); return self; };
  self.values = (...args: unknown[]) => {
    mockFns.values(...args);
    return {
      onConflictDoUpdate: (...cArgs: unknown[]) => {
        mockFns.onConflictDoUpdate(...cArgs);
        return { returning: () => { mockFns.returning(); return insertResult; } };
      },
      onConflictDoNothing: () => {
        mockFns.onConflictDoNothing();
        return { returning: () => [] };
      },
    };
  };
  return { db: self };
});

vi.mock("@/lib/db/schema", () => ({
  eventAttendance: {
    id: "id",
    eventId: "event_id",
    memberId: "member_id",
    status: "status",
    updatedAt: "updated_at",
  },
  members: {
    id: "id",
    name: "name",
    voiceGroup: "voice_group",
    ensembleId: "ensemble_id",
  },
}));

import { AttendanceRepository } from "../attendance-repository";

describe("AttendanceRepository", () => {
  let repo: AttendanceRepository;

  beforeEach(() => {
    Object.values(mockFns).forEach((fn) => fn.mockClear());
    selectWhereResult = [];
    insertResult = [];
    repo = new AttendanceRepository("ensemble-1");
  });

  it("findByEvent joins with members and filters by eventId", async () => {
    await repo.findByEvent("event-1");

    expect(mockFns.select).toHaveBeenCalled();
    expect(mockFns.from).toHaveBeenCalled();
    expect(mockFns.innerJoin).toHaveBeenCalled();
    expect(mockFns.where).toHaveBeenCalled();
    expect(mockFns.orderBy).toHaveBeenCalled();
  });

  it("upsert uses onConflictDoUpdate", async () => {
    insertResult = [{
      id: "att-1",
      eventId: "event-1",
      memberId: "member-1",
      status: "yes",
      updatedAt: new Date(),
    }];

    await repo.upsert("event-1", "member-1", "yes");

    expect(mockFns.insert).toHaveBeenCalled();
    expect(mockFns.values).toHaveBeenCalled();
    expect(mockFns.onConflictDoUpdate).toHaveBeenCalled();
    expect(mockFns.returning).toHaveBeenCalled();
  });

  it("bulkCreateForEvent inserts for all ensemble members with onConflictDoNothing", async () => {
    selectWhereResult = [{ id: "m-1" }, { id: "m-2" }];

    await repo.bulkCreateForEvent("event-1");

    expect(mockFns.insert).toHaveBeenCalled();
    expect(mockFns.values).toHaveBeenCalled();
    expect(mockFns.onConflictDoNothing).toHaveBeenCalled();
  });

  it("bulkCreateForEvent does nothing when no members exist", async () => {
    selectWhereResult = [];

    await repo.bulkCreateForEvent("event-1");

    expect(mockFns.insert).not.toHaveBeenCalled();
  });

  it("findByEventAndMember returns null when no record", async () => {
    selectWhereResult = [];

    const result = await repo.findByEventAndMember("event-1", "member-1");

    expect(result).toBeNull();
    expect(mockFns.where).toHaveBeenCalled();
  });
});
