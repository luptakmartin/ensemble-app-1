import { eq, and } from "drizzle-orm";
import { BaseRepository } from "./base-repository";
import { members, memberRoles, userRoleEnum } from "@/lib/db/schema";

export type Member = typeof members.$inferSelect & {
  roles: UserRole[];
};

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export type CreateMemberData = {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  voiceGroup?: "S" | "A" | "T" | "B";
};

export type UpdateMemberData = Partial<
  Pick<typeof members.$inferSelect, "name" | "email" | "phone" | "profilePicture" | "voiceGroup">
>;

export class MemberRepository extends BaseRepository {
  async findAll(): Promise<Member[]> {
    const rows = await this.db
      .select()
      .from(members)
      .leftJoin(memberRoles, eq(memberRoles.memberId, members.id))
      .where(eq(members.ensembleId, this.ensembleId));

    return this.aggregateMembers(rows);
  }

  async findById(id: string): Promise<Member | null> {
    const rows = await this.db
      .select()
      .from(members)
      .leftJoin(memberRoles, eq(memberRoles.memberId, members.id))
      .where(and(eq(members.id, id), eq(members.ensembleId, this.ensembleId)));

    const result = this.aggregateMembers(rows);
    return result[0] ?? null;
  }

  async findByUserId(userId: string): Promise<Member | null> {
    const rows = await this.db
      .select()
      .from(members)
      .leftJoin(memberRoles, eq(memberRoles.memberId, members.id))
      .where(
        and(eq(members.userId, userId), eq(members.ensembleId, this.ensembleId))
      );

    const result = this.aggregateMembers(rows);
    return result[0] ?? null;
  }

  async create(data: CreateMemberData): Promise<Member> {
    const [inserted] = await this.db
      .insert(members)
      .values({
        ensembleId: this.ensembleId,
        ...data,
      })
      .returning();

    return { ...inserted, roles: [] };
  }

  async update(id: string, data: UpdateMemberData): Promise<Member> {
    const [updated] = await this.db
      .update(members)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(members.id, id), eq(members.ensembleId, this.ensembleId)))
      .returning();

    if (!updated) {
      throw new Error(`Member ${id} not found`);
    }

    // Fetch roles
    const roles = await this.db
      .select()
      .from(memberRoles)
      .where(eq(memberRoles.memberId, id));

    return { ...updated, roles: roles.map((r) => r.role) };
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(members)
      .where(and(eq(members.id, id), eq(members.ensembleId, this.ensembleId)));
  }

  async addRole(memberId: string, role: UserRole): Promise<void> {
    await this.db.insert(memberRoles).values({ memberId, role });
  }

  async removeRole(memberId: string, role: UserRole): Promise<void> {
    await this.db
      .delete(memberRoles)
      .where(
        and(eq(memberRoles.memberId, memberId), eq(memberRoles.role, role))
      );
  }

  private aggregateMembers(
    rows: {
      members: typeof members.$inferSelect;
      member_roles: typeof memberRoles.$inferSelect | null;
    }[]
  ): Member[] {
    const memberMap = new Map<string, Member>();

    for (const row of rows) {
      const existing = memberMap.get(row.members.id);
      if (existing) {
        if (row.member_roles) {
          existing.roles.push(row.member_roles.role);
        }
      } else {
        memberMap.set(row.members.id, {
          ...row.members,
          roles: row.member_roles ? [row.member_roles.role] : [],
        });
      }
    }

    return Array.from(memberMap.values());
  }
}
