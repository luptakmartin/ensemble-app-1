import { eq, and } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { BaseRepository } from "./base-repository";
import { eventAttendance, members } from "@/lib/db/schema";

export type Attendance = typeof eventAttendance.$inferSelect;

export type AttendanceWithMember = Attendance & {
  memberName: string;
  voiceGroup: "S" | "A" | "T" | "B" | null;
};

export class AttendanceRepository extends BaseRepository {
  async findByEvent(eventId: string): Promise<AttendanceWithMember[]> {
    const rows = await this.db
      .select({
        id: eventAttendance.id,
        eventId: eventAttendance.eventId,
        memberId: eventAttendance.memberId,
        status: eventAttendance.status,
        updatedAt: eventAttendance.updatedAt,
        memberName: members.name,
        voiceGroup: members.voiceGroup,
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
    status: Attendance["status"]
  ): Promise<Attendance> {
    const [result] = await this.db
      .insert(eventAttendance)
      .values({ eventId, memberId, status })
      .onConflictDoUpdate({
        target: [eventAttendance.eventId, eventAttendance.memberId],
        set: { status, updatedAt: new Date() },
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
}
