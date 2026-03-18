import { eq, and, inArray } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { BaseRepository } from "./base-repository";
import { eventAttendance, members } from "@/lib/db/schema";

export type Attendance = typeof eventAttendance.$inferSelect;

export type AttendanceWithMember = Attendance & {
  memberName: string;
  voiceGroup: "S" | "A" | "T" | "B" | null;
  profilePicture: string | null;
};

export class AttendanceRepository extends BaseRepository {
  async findByEvent(eventId: string): Promise<AttendanceWithMember[]> {
    const rows = await this.db
      .select({
        id: eventAttendance.id,
        eventId: eventAttendance.eventId,
        memberId: eventAttendance.memberId,
        status: eventAttendance.status,
        note: eventAttendance.note,
        updatedAt: eventAttendance.updatedAt,
        memberName: members.name,
        voiceGroup: members.voiceGroup,
        profilePicture: members.profilePicture,
      })
      .from(eventAttendance)
      .innerJoin(members, eq(members.id, eventAttendance.memberId))
      .where(
        and(
          eq(eventAttendance.eventId, eventId),
          eq(members.ensembleId, this.ensembleId)
        )
      )
      .orderBy(asc(members.name));

    return rows;
  }

  async upsert(
    eventId: string,
    memberId: string,
    status?: Attendance["status"],
    note?: string | null
  ): Promise<Attendance> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (status !== undefined) set.status = status;
    if (note !== undefined) set.note = note;

    const values: Record<string, unknown> = { eventId, memberId };
    if (status !== undefined) values.status = status;
    if (note !== undefined) values.note = note;

    const [result] = await this.db
      .insert(eventAttendance)
      .values(values as typeof eventAttendance.$inferInsert)
      .onConflictDoUpdate({
        target: [eventAttendance.eventId, eventAttendance.memberId],
        set,
      })
      .returning();

    return result;
  }

  async bulkCreateForEvent(eventId: string): Promise<void> {
    const allMembers = await this.db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.ensembleId, this.ensembleId));

    if (allMembers.length === 0) return;

    await this.db
      .insert(eventAttendance)
      .values(
        allMembers.map((m) => ({
          eventId,
          memberId: m.id,
          status: "unset" as const,
        }))
      )
      .onConflictDoNothing();
  }

  async findByEventAndMember(
    eventId: string,
    memberId: string
  ): Promise<Attendance | null> {
    const rows = await this.db
      .select()
      .from(eventAttendance)
      .where(
        and(
          eq(eventAttendance.eventId, eventId),
          eq(eventAttendance.memberId, memberId)
        )
      );

    return rows[0] ?? null;
  }

  async updateNote(
    eventId: string,
    memberId: string,
    note: string | null
  ): Promise<Attendance> {
    return this.upsert(eventId, memberId, undefined, note);
  }

  async findByEvents(eventIds: string[]): Promise<AttendanceWithMember[]> {
    if (eventIds.length === 0) return [];

    const rows = await this.db
      .select({
        id: eventAttendance.id,
        eventId: eventAttendance.eventId,
        memberId: eventAttendance.memberId,
        status: eventAttendance.status,
        note: eventAttendance.note,
        updatedAt: eventAttendance.updatedAt,
        memberName: members.name,
        voiceGroup: members.voiceGroup,
        profilePicture: members.profilePicture,
      })
      .from(eventAttendance)
      .innerJoin(members, eq(members.id, eventAttendance.memberId))
      .where(
        and(
          inArray(eventAttendance.eventId, eventIds),
          eq(members.ensembleId, this.ensembleId)
        )
      )
      .orderBy(asc(members.name));

    return rows;
  }

  async findByMemberForEvents(
    memberId: string,
    eventIds: string[]
  ): Promise<Attendance[]> {
    if (eventIds.length === 0) return [];

    const rows = await this.db
      .select()
      .from(eventAttendance)
      .where(
        and(
          eq(eventAttendance.memberId, memberId),
          inArray(eventAttendance.eventId, eventIds)
        )
      );

    return rows;
  }
}
