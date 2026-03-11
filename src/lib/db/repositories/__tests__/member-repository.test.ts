import { describe, it, expect, vi, beforeEach } from "vitest";

// The MemberRepository uses chained queries:
// - findAll/findById: select().from().leftJoin().where()
// - create: insert().values().returning()
// - update: update().set().where().returning() + select().from().where() (for roles)
// - delete/addRole/removeRole/setRoles: delete().where() / insert().values()

vi.mock("@/lib/db/drizzle", () => {
  const returningMock = vi.fn();
  const whereMock = vi.fn(() => ({ returning: returningMock }));
  const setMock = vi.fn(() => ({ where: whereMock }));
  const valuesMock = vi.fn(() => ({ returning: returningMock }));
  const joinWhereMock = vi.fn(() => Promise.resolve([]));
  const leftJoinMock = vi.fn(() => ({ where: joinWhereMock }));
  const fromMock = vi.fn(() => ({
    leftJoin: leftJoinMock,
    where: joinWhereMock,
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
        leftJoinMock,
        joinWhereMock,
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
import { MemberRepository } from "../member-repository";

const mocks = (db as unknown as { _mocks: Record<string, ReturnType<typeof vi.fn>> })._mocks;

describe("MemberRepository", () => {
  const ensembleId = "ensemble-123";
  let repo: MemberRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new MemberRepository(ensembleId);
  });

  describe("findAll", () => {
    it("returns aggregated members with roles", async () => {
      const memberData = {
        id: "m1",
        ensembleId,
        userId: "u1",
        name: "Alice",
        email: "alice@test.com",
        phone: null,
        profilePicture: null,
        voiceGroup: "S",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mocks.joinWhereMock.mockResolvedValue([
        { members: memberData, member_roles: { id: "r1", memberId: "m1", role: "admin" } },
        { members: memberData, member_roles: { id: "r2", memberId: "m1", role: "member" } },
      ]);

      const result = await repo.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Alice");
      expect(result[0].roles).toEqual(["admin", "member"]);
      expect(mocks.leftJoinMock).toHaveBeenCalled();
    });

    it("returns empty array when no members", async () => {
      mocks.joinWhereMock.mockResolvedValue([]);
      const result = await repo.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("returns member when found", async () => {
      const memberData = {
        id: "m1",
        ensembleId,
        userId: "u1",
        name: "Bob",
        email: "bob@test.com",
        phone: null,
        profilePicture: null,
        voiceGroup: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mocks.joinWhereMock.mockResolvedValue([
        { members: memberData, member_roles: { id: "r1", memberId: "m1", role: "member" } },
      ]);

      const result = await repo.findById("m1");
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Bob");
      expect(result!.roles).toEqual(["member"]);
    });

    it("returns null when not found", async () => {
      mocks.joinWhereMock.mockResolvedValue([]);
      const result = await repo.findById("missing");
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("inserts member with ensembleId and returns with empty roles", async () => {
      const inserted = {
        id: "m1",
        ensembleId,
        userId: "u1",
        name: "Charlie",
        email: "charlie@test.com",
      };
      mocks.returningMock.mockResolvedValue([inserted]);

      const result = await repo.create({
        userId: "u1",
        name: "Charlie",
        email: "charlie@test.com",
      });
      expect(result.roles).toEqual([]);
      expect(result.name).toBe("Charlie");
      expect(mocks.insertMock).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("updates member and fetches roles", async () => {
      const updated = { id: "m1", name: "Updated" };
      mocks.returningMock.mockResolvedValue([updated]);
      // Mock the roles fetch: select().from().where()
      mocks.joinWhereMock.mockResolvedValue([{ role: "admin" }]);

      const result = await repo.update("m1", { name: "Updated" });
      expect(result.name).toBe("Updated");
      expect(result.roles).toEqual(["admin"]);
      expect(mocks.setMock).toHaveBeenCalled();
    });

    it("throws when member not found", async () => {
      mocks.returningMock.mockResolvedValue([]);
      await expect(repo.update("missing", { name: "X" })).rejects.toThrow(
        "Member missing not found"
      );
    });
  });

  describe("delete", () => {
    it("deletes by id and ensembleId", async () => {
      await repo.delete("m1");
      expect(mocks.deleteMock).toHaveBeenCalled();
      expect(mocks.deleteWhereMock).toHaveBeenCalled();
    });
  });

  describe("addRole", () => {
    it("inserts a role for the member", async () => {
      mocks.returningMock.mockResolvedValue([]);
      await repo.addRole("m1", "director");
      expect(mocks.insertMock).toHaveBeenCalled();
      expect(mocks.valuesMock).toHaveBeenCalledWith({
        memberId: "m1",
        role: "director",
      });
    });
  });

  describe("setRoles", () => {
    it("deletes existing roles and inserts new ones", async () => {
      mocks.returningMock.mockResolvedValue([]);
      await repo.setRoles("m1", ["admin", "member"]);
      // Should delete first, then insert
      expect(mocks.deleteMock).toHaveBeenCalled();
      expect(mocks.insertMock).toHaveBeenCalled();
      expect(mocks.valuesMock).toHaveBeenCalledWith([
        { memberId: "m1", role: "admin" },
        { memberId: "m1", role: "member" },
      ]);
    });

    it("only deletes when roles array is empty", async () => {
      await repo.setRoles("m1", []);
      expect(mocks.deleteMock).toHaveBeenCalled();
      expect(mocks.insertMock).not.toHaveBeenCalled();
    });
  });
});
