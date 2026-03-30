import { eq, and, gte, lt } from "drizzle-orm";
import { asc, desc } from "drizzle-orm";
import { BaseRepository } from "./base-repository";
import { events } from "@/lib/db/schema";

export type Event = typeof events.$inferSelect;

export type CreateEventData = {
  name: string;
  type: Event["type"];
  date: Date | string;
  time: string;
  timeTo?: string;
  place: string;
  description?: string;
};

export type UpdateEventData = Partial<CreateEventData>;

export class EventRepository extends BaseRepository {
  async findUpcoming(): Promise<Event[]> {
    return this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.ensembleId, this.ensembleId),
          gte(events.date, new Date())
        )
      )
      .orderBy(asc(events.date), asc(events.time));
  }

  async findPast(): Promise<Event[]> {
    return this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.ensembleId, this.ensembleId),
          lt(events.date, new Date())
        )
      )
      .orderBy(desc(events.date), desc(events.time));
  }

  async findById(id: string): Promise<Event | null> {
    const rows = await this.db
      .select()
      .from(events)
      .where(
        and(eq(events.id, id), eq(events.ensembleId, this.ensembleId))
      );

    return rows[0] ?? null;
  }

  async create(data: CreateEventData): Promise<Event> {
    const [inserted] = await this.db
      .insert(events)
      .values({
        ensembleId: this.ensembleId,
        ...data,
        date: typeof data.date === "string" ? new Date(data.date) : data.date,
      })
      .returning();

    return inserted;
  }

  async update(id: string, data: UpdateEventData): Promise<Event> {
    const updateValues: Record<string, unknown> = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.date) {
      updateValues.date =
        typeof data.date === "string" ? new Date(data.date) : data.date;
    }

    const [updated] = await this.db
      .update(events)
      .set(updateValues)
      .where(
        and(eq(events.id, id), eq(events.ensembleId, this.ensembleId))
      )
      .returning();

    if (!updated) {
      throw new Error(`Event ${id} not found`);
    }

    return updated;
  }

  async findByDateRange(from?: Date, to?: Date, type?: string): Promise<Event[]> {
    const conditions = [eq(events.ensembleId, this.ensembleId)];
    if (from) conditions.push(gte(events.date, from));
    if (to) conditions.push(lt(events.date, to));
    if (type) conditions.push(eq(events.type, type as Event["type"]));

    return this.db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(asc(events.date), asc(events.time));
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(events)
      .where(
        and(eq(events.id, id), eq(events.ensembleId, this.ensembleId))
      );
  }
}
